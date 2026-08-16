import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('dist/ is missing. Run npm run build first.');
  process.exit(1);
}

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const relativeFiles = new Set(files.map((file) => `/${path.relative(dist, file).replaceAll('\\', '/')}`));
const pages = new Set();
const findings = [];
const currentYear = new Date().getUTCFullYear();

const pageSourceRoot = path.join(root, 'src', 'pages');
const plannerCtaProps = new Set(['source', 'heading', 'description']);
const plannerCtaSources = new Map();

for (const file of walk(pageSourceRoot).filter((sourceFile) => sourceFile.endsWith('.astro'))) {
  const source = fs.readFileSync(file, 'utf8');
  const route = path.relative(pageSourceRoot, file).replaceAll('\\', '/');

  for (const match of source.matchAll(/<PlannerCTA\b([\s\S]*?)\/>/g)) {
    const attributes = match[1];
    const props = [...attributes.matchAll(/\b([A-Za-z][\w-]*)\s*=/g)].map((propMatch) => propMatch[1]);
    const unsupported = props.filter((prop) => !plannerCtaProps.has(prop));

    for (const prop of unsupported) {
      findings.push({ type: 'unsupported_planner_cta_prop', route, value: prop });
    }

    const sourceMatch = attributes.match(/\bsource\s*=\s*["']([^"']+)["']/);
    if (!sourceMatch) {
      findings.push({ type: 'invalid_planner_cta_source', route, value: 'source must be a non-empty string literal' });
      continue;
    }

    const ctaSource = sourceMatch[1].trim();
    if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(ctaSource)) {
      findings.push({ type: 'invalid_planner_cta_source', route, value: ctaSource });
      continue;
    }

    const existing = plannerCtaSources.get(ctaSource);
    if (existing) {
      findings.push({ type: 'duplicate_planner_cta_source', route, target: existing, value: ctaSource });
    } else {
      plannerCtaSources.set(ctaSource, route);
    }
  }
}

for (const file of htmlFiles) {
  const relative = `/${path.relative(dist, file).replaceAll('\\', '/')}`;
  pages.add(relative);
  if (relative.endsWith('/index.html')) pages.add(relative.slice(0, -10));
  if (relative === '/index.html') pages.add('/');
}

const requiredMarkers = [
  {
    file: 'index.html',
    pattern: /window\.gtag\s*=/,
    label: 'globally available GA event function',
  },
  {
    file: 'guides/best-home-sauna/index.html',
    pattern: /planner_first_10/,
    label: 'best-home-sauna planner campaign',
  },
  {
    file: 'guides/best-2-person-outdoor-sauna/index.html',
    pattern: /planner_first_10/,
    label: 'best-2-person planner campaign',
  },
  {
    file: 'guides/best-portable-sauna/index.html',
    pattern: /planner_first_10/,
    label: 'best-portable planner campaign',
  },
  {
    file: 'guides/best-indoor-sauna-kits/index.html',
    pattern: /placement=indoor_sauna_kits_above_fold/,
    label: 'indoor-sauna-kits planner attribution',
  },
  {
    file: 'guides/best-indoor-sauna-kits/index.html',
    pattern: /Representative compact infrared cabin; not the exact Dynamic Barcelona model\./,
    label: 'indoor infrared representative-image disclosure',
  },
  {
    file: 'guides/best-indoor-sauna-kits/index.html',
    pattern: /Representative steam-tent setup; not the exact SereneLife model\./,
    label: 'portable steam representative-image disclosure',
  },
  {
    file: null,
    pattern: /backyard-sauna-leads\.adunyadeth\.workers\.dev\/v1\/leads/,
    label: 'server-backed planner endpoint',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="location"[^>]*required[^>]*>[\s\S]*?<option>Unsure<\/option>/,
    label: 'planner unsure location option',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="region"[^>]*pattern="\[0-9\]\{5\}\(-\[0-9\]\{4\}\)\?"[^>]*required/,
    label: 'required planner ZIP field',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="contactConsent"[^>]*required/,
    label: 'required review contact consent',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="partnerConsent"/,
    label: 'separate optional partner-sharing consent',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="installation"[^>]*>\s*<option>Undecided<\/option>/,
    label: 'neutral installation-help default',
  },
  {
    file: null,
    pattern: /lead_submitted/,
    label: 'server-confirmed new-lead analytics event',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /data-track-start-event="lead_form_started"/,
    label: 'manual review form start event',
  },
  {
    file: 'guides/sauna-ventilation/index.html',
    pattern: /sauna_ventilation_after_layouts/,
    label: 'ventilation guide planner path',
  },
  {
    file: 'guides/sauna-ventilation/index.html',
    pattern: /support\.harvia\.com\/hc\/en-gb\/articles\/21953036825628-Ventilation-in-the-sauna/,
    label: 'ventilation guide primary source',
  },
  {
    file: 'guides/sauna-insulation/index.html',
    pattern: /sauna_insulation_after_system_examples/,
    label: 'insulation guide planner path',
  },
  {
    file: 'guides/sauna-insulation/index.html',
    pattern: /support\.harvia\.com\/hc\/en-gb\/articles\/21953077934620-/,
    label: 'insulation guide primary source',
  },
  {
    file: 'guides/sauna-door-guide/index.html',
    pattern: /sauna_door_after_size_checks/,
    label: 'sauna door guide planner path',
  },
  {
    file: 'guides/sauna-door-guide/index.html',
    pattern: /71-0156_Euro_Outdoor_Room_Rev_D_09-24-2025\.pdf/,
    label: 'sauna door guide primary source',
  },
  {
    file: 'guides/electric-vs-wood-fired-sauna/index.html',
    pattern: /electric_vs_wood_after_site_comparison/,
    label: 'electric-vs-wood guide planner path',
  },
  {
    file: 'guides/electric-vs-wood-fired-sauna/index.html',
    pattern: /JH60WU1UL\/kip60w-60-kw-240v-steel/,
    label: 'electric-vs-wood guide electric primary source',
  },
  {
    file: 'guides/electric-vs-wood-fired-sauna/index.html',
    pattern: /WKPR20M\/pro-20-black/,
    label: 'electric-vs-wood guide wood primary source',
  },
  {
    file: 'guides/wood-burning-sauna/index.html',
    pattern: /wood_burning_sauna_after_project_screen/,
    label: 'wood-burning sauna guide planner path',
  },
  {
    file: 'guides/wood-burning-sauna/index.html',
    pattern: /how-do-you-choose-the-right-wood-burning-heater/,
    label: 'wood-burning sauna guide primary source',
  },
  {
    file: 'guides/propane-sauna-heater/index.html',
    pattern: /propane_heater_after_current_models/,
    label: 'propane heater guide planner path',
  },
  {
    file: 'guides/propane-sauna-heater/index.html',
    pattern: /SAUNA_GAS_HEATER_INSTALLATION_GUIDE_SCANDIA\.pdf/,
    label: 'propane heater guide primary source',
  },
  {
    file: 'guides/sauna-maintenance-guide/index.html',
    pattern: /22158333579676-Maintaining-your-sauna/,
    label: 'sauna maintenance guide primary source',
  },
  {
    file: 'guides/sauna-maintenance-guide/index.html',
    pattern: /data-cta-position="maintenance_supplies"/,
    label: 'sauna maintenance affiliate attribution',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /<label class="hidden" aria-hidden="true">Website<input name="website" type="text" tabindex="-1" autocomplete="off"/,
    label: 'non-interactive planner honeypot',
  },
  {
    file: null,
    pattern: /lead_duplicate_detected/,
    label: 'duplicate lead analytics guard',
  },
  {
    file: 'index.html',
    pattern: /localStorage\.setItem\(["']bsp_newsletter_signup_pending["']/,
    label: 'pending newsletter signup state',
  },
  {
    file: 'newsletter/confirmed/index.html',
    pattern: /localStorage\.getItem\([^)]*\)[\s\S]*confirmation_method:["']pending_browser_signup["']/,
    label: 'pending-state newsletter confirmation guard',
  },
  {
    file: 'guides/best-home-sauna/index.html',
    pattern: /sun-home-equinox-2-person-full-spectrum-infrared-sauna/,
    label: 'protected Sun Home Equinox destination',
  },
  {
    file: 'guides/best-2-person-outdoor-sauna/index.html',
    pattern: /2-person-outdoor-infrared-sauna/,
    label: 'protected Sun Home Luminar destination',
  },
  {
    file: 'guides/sauna-vs-hot-tub/index.html',
    pattern: /sauna_vs_hot_tub_after_intro/,
    label: 'sauna versus hot tub planner attribution',
  },
  {
    file: 'guides/sauna-vs-hot-tub/index.html',
    pattern: /www\.cdc\.gov\/healthy-swimming\/about\/home-pool-and-hot-tub-water-treatment-and-testing\.html/,
    label: 'sauna versus hot tub primary water-care source',
  },
  {
    file: 'guides/best-5-person-sauna/index.html',
    pattern: /best_5_person_sauna_after_method/,
    label: 'five-person sauna planner attribution',
  },
  {
    file: 'guides/best-5-person-sauna/index.html',
    pattern: /leisurecraft\.com\/5-7x7-barrel-sauna-with-porch/,
    label: 'five-person sauna manufacturer capacity source',
  },
  {
    file: 'guides/best-infrared-sauna-blanket/index.html',
    pattern: /Lifepro-Fitness-Recalls-Bioremedy-Infrared-Sauna-Blankets/,
    label: 'infrared blanket LifePro recall source',
  },
  {
    file: 'guides/best-infrared-sauna-blanket/index.html',
    pattern: /Tzumi-Electronics-Recalls-SLF-Sauna-Blankets/,
    label: 'infrared blanket SLF recall source',
  },
  {
    file: 'guides/best-infrared-sauna-blanket/index.html',
    pattern: /infrared_blanket_after_scope/,
    label: 'infrared blanket planner attribution',
  },
  {
    file: 'guides/sauna-cold-plunge/index.html',
    pattern: /pubmed\.ncbi\.nlm\.nih\.gov\/42390474/,
    label: 'sauna cold plunge current controlled study',
  },
  {
    file: 'guides/sauna-room-ideas/index.html',
    pattern: /sauna_room_ideas_after_layouts/,
    label: 'sauna room ideas planner attribution',
  },
  {
    file: 'guides/sauna-room-ideas/index.html',
    pattern: /choosing-sauna-benches/,
    label: 'sauna room ideas Harvia bench source',
  },
  {
    file: 'guides/sauna-room-ideas/index.html',
    pattern: /custom-freestanding-saunas/,
    label: 'sauna room ideas Finnleo room source',
  },
  {
    file: 'guides/outdoor-sauna-ideas/index.html',
    pattern: /outdoor_sauna_ideas_after_layouts/,
    label: 'outdoor sauna ideas planner attribution',
  },
  {
    file: 'guides/outdoor-sauna-ideas/index.html',
    pattern: /saunalife\.com\/technical-information/,
    label: 'outdoor sauna ideas technical source',
  },
  {
    file: 'guides/outdoor-sauna-ideas/index.html',
    pattern: /\/guides\/outdoor-sauna-for-sale\//,
    label: 'outdoor sauna ideas current listings path',
  },
  {
    file: 'guides/sauna-cold-plunge/index.html',
    pattern: /sauna_cold_plunge_after_intro/,
    label: 'sauna cold plunge planner attribution',
  },
  {
    file: 'brands/finnish-sauna-builders-review/index.html',
    pattern: /Finnish Sauna Builders: compare the written project, not the storefront/,
    label: 'Finnish Sauna Builders evidence-led review heading',
  },
  {
    file: 'brands/finnish-sauna-builders-review/index.html',
    pattern: /finnish_builders_after_verdict/,
    label: 'Finnish Sauna Builders planner attribution',
  },
  {
    file: 'brands/finnish-sauna-builders-review/index.html',
    pattern: /finnishsaunabuilders\.com\/pages\/shipping-delivery/,
    label: 'Finnish Sauna Builders delivery source',
  },
  {
    file: 'brands/finnish-sauna-builders-review/index.html',
    pattern: /finnishsaunabuilders\.com\/pages\/refund-cancellation-policy/,
    label: 'Finnish Sauna Builders cancellation source',
  },
  {
    file: 'guides/almost-heaven-barrel-sauna/index.html',
    pattern: /\/guides\/barrel-sauna-costco\//,
    label: 'Almost Heaven barrel Costco comparison path',
  },
  {
    file: 'guides/best-barrel-sauna-kits/index.html',
    pattern: /\/guides\/barrel-sauna-costco\//,
    label: 'barrel kit Costco comparison path',
  },
  {
    file: 'guides/how-to-build-a-sauna/index.html',
    pattern: /\/guides\/sauna-door-guide\//,
    label: 'sauna build door planning path',
  },
  {
    file: 'guides/sauna-room-ideas/index.html',
    pattern: /\/guides\/sauna-door-guide\//,
    label: 'sauna room door planning path',
  },
  {
    file: 'guides/sauna-tent/index.html',
    pattern: /sauna_tent_after_verdict/,
    label: 'sauna tent planner attribution',
  },
  {
    file: 'guides/sauna-tent/index.html',
    pattern: /cpsc\.gov\/safety-education\/safety-guides\/carbon-monoxide\/carbon-monoxide-fact-sheet/i,
    label: 'sauna tent CPSC carbon monoxide source',
  },
  {
    file: 'guides/sauna-tent/index.html',
    pattern: /MORZH%20MAX%20\.pdf/i,
    label: 'sauna tent manufacturer technical certificate',
  },
  {
    file: 'guides/best-portable-sauna/index.html',
    pattern: /\/guides\/sauna-tent\//,
    label: 'portable sauna wood-fired tent path',
  },
  {
    file: 'guides/mobile-sauna-for-sale/index.html',
    pattern: /\/guides\/sauna-tent\//,
    label: 'mobile sauna portable tent path',
  },
  {
    file: 'guides/sauna-privacy-screen/index.html',
    pattern: /sauna_privacy_after_scope/,
    label: 'privacy screen planner attribution',
  },
  {
    file: 'guides/sauna-privacy-screen/index.html',
    pattern: /call811\.com\/811-In-Your-State/i,
    label: 'privacy screen utility locate source',
  },
  {
    file: 'guides/outdoor-sauna-ideas/index.html',
    pattern: /\/guides\/sauna-privacy-screen\//,
    label: 'outdoor ideas privacy planning path',
  },
  {
    file: 'guides/best-location-backyard-sauna/index.html',
    pattern: /\/guides\/sauna-privacy-screen\//,
    label: 'location guide privacy planning path',
  },
  {
    file: 'guides/sauna-for-hangover/index.html',
    pattern: /niaaa\.nih\.gov\/publications\/brochures-and-fact-sheets\/hangovers/i,
    label: 'hangover NIAAA evidence source',
  },
  {
    file: 'guides/sauna-for-hangover/index.html',
    pattern: /understanding-dangers-of-alcohol-overdose/i,
    label: 'hangover alcohol overdose source',
  },
  {
    file: 'guides/how-to-use-a-sauna/index.html',
    pattern: /\/guides\/sauna-for-hangover\//,
    label: 'beginner safety alcohol path',
  },
  {
    file: 'guides/how-long-to-stay-in-sauna/index.html',
    pattern: /\/guides\/sauna-for-hangover\//,
    label: 'duration safety alcohol path',
  },
  {
    file: 'guides/calories-burned-in-sauna/index.html',
    pattern: /pubmed\.ncbi\.nlm\.nih\.gov\/30800676/i,
    label: 'sauna calorie protocol source',
  },
  {
    file: 'guides/calories-burned-in-sauna/index.html',
    pattern: /healthy-weight-growth\/physical-activity/i,
    label: 'sauna calorie CDC weight guidance',
  },
  {
    file: 'guides/sauna-for-weight-loss/index.html',
    pattern: /\/guides\/calories-burned-in-sauna\//,
    label: 'weight loss calorie evidence path',
  },
  {
    file: 'guides/sauna-health-benefits/index.html',
    pattern: /\/guides\/calories-burned-in-sauna\//,
    label: 'health evidence calorie path',
  },
  {
    file: 'guides/sauna-before-or-after-workout/index.html',
    pattern: /pubmed\.ncbi\.nlm\.nih\.gov\/41032138/i,
    label: 'workout timing systematic review source',
  },
  {
    file: 'guides/sauna-before-or-after-workout/index.html',
    pattern: /heat-health\/risk-factors\/heat-and-athletes/i,
    label: 'workout timing CDC heat source',
  },
  {
    file: 'guides/sauna-after-workout/index.html',
    pattern: /pubmed\.ncbi\.nlm\.nih\.gov\/37398966/i,
    label: 'post-workout narrow infrared trial source',
  },
  {
    file: 'guides/how-to-use-a-sauna/index.html',
    pattern: /\/guides\/sauna-before-or-after-workout\//,
    label: 'beginner guide workout timing path',
  },
  {
    file: 'guides/how-long-to-stay-in-sauna/index.html',
    pattern: /\/guides\/sauna-before-or-after-workout\//,
    label: 'duration guide workout timing path',
  },
];

for (const marker of requiredMarkers) {
  const content = marker.file
    ? (fs.existsSync(path.join(dist, marker.file)) ? fs.readFileSync(path.join(dist, marker.file), 'utf8') : '')
    : files.filter((file) => file.endsWith('.js')).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  if (!marker.pattern.test(content)) {
    findings.push({ type: 'missing_required_marker', route: marker.file ? `/${marker.file}` : '/assets/*.js', value: marker.label });
  }
}

const staleClaims = [
  ['guides/best-2-person-outdoor-sauna/index.html', 'best 2-person sauna under $1,000 full stop'],
  ['guides/best-2-person-outdoor-sauna/index.html', "Most experienced sauna users wish they'd sized up"],
  ['guides/best-home-sauna/index.html', '$700-$1,500 for a plug-in infrared unit'],
  ['guides/index.html', 'why low vents are correct'],
  ['guides/index.html', 'Full DIY build walkthrough'],
  ['guides/index.html', 'Vapor barrier placement, insulation types, R-values, and the mistakes that cause mold and rot'],
  ['guides/index.html', 'Convenience vs authenticity the honest take'],
  ['guides/propane-sauna-heater/index.html', 'Kuuma Vapor-Fire 100'],
  ['guides/propane-sauna-heater/index.html', 'Narvi Gas Sauna Heater'],
  ['guides/propane-sauna-heater/index.html', '1.5-2.5 gallons'],
  ['guides/propane-sauna-heater/index.html', 'A properly installed unit with a working flue eliminates this risk'],
  ['guides/sauna-maintenance-guide/index.html', 'A well-built sauna can last 40 years'],
  ['guides/sauna-maintenance-guide/index.html', 'Takes maybe 30 minutes a month'],
  ['guides/sauna-maintenance-guide/index.html', "Use a timer outlet if you're forgetful"],
  ['guides/sauna-maintenance-guide/index.html', 'can become projectiles when water hits them'],
  ['guides/sauna-maintenance-guide/index.html', 'Every 2-3 years'],
  ['guides/sauna-maintenance-guide/index.html', 'Every 2–3 years'],
  ['guides/index.html', 'Keep your sauna lasting 20–40 years'],
  ['guides/sauna-vs-hot-tub/index.html', 'A hot tub typically costs $50-$100/month'],
  ['guides/sauna-vs-hot-tub/index.html', 'Over 10 years the cost difference is $8,000-$15,000'],
  ['guides/sauna-vs-hot-tub/index.html', 'A well-built cedar sauna lasts 20-30+ years'],
  ['guides/sauna-vs-hot-tub/index.html', 'Hot tubs typically last 10-15 years'],
  ['guides/sauna-vs-hot-tub/index.html', 'For health benefits, lower maintenance, and long-term cost: sauna wins'],
  ['guides/sauna-vs-hot-tub/index.html', 'A barrel sauna plus a modest hot tub runs $6,000-$10,000 installed'],
  ['guides/index.html', 'Cost, maintenance, health benefits, and which makes more sense for your situation. Real numbers.'],
  ['guides/best-5-person-sauna/index.html', '60-75 square feet of floor area'],
  ['guides/best-5-person-sauna/index.html', '350-500 cubic feet'],
  ['guides/best-5-person-sauna/index.html', '8-9kW electric is the standard'],
  ['guides/best-5-person-sauna/index.html', 'right buy if you plan to put this in the backyard and forget about it for a decade'],
  ['guides/best-5-person-sauna/index.html', 'Same heater, same footprint penalty'],
  ['guides/best-5-person-sauna/index.html', '12-15 square feet per person'],
  ['guides/best-5-person-sauna/index.html', '40 lbs per sq ft live load'],
  ['guides/best-5-person-sauna/index.html', 'budget $500-$1,500 for an electrician'],
  ['guides/best-5-person-sauna/index.html', 'Undersizing the heater is the single most common mistake'],
  ['guides/best-infrared-sauna-blanket/index.html', 'Low-EMF is the most important spec to check'],
  ['guides/best-infrared-sauna-blanket/index.html', 'Budget blankets use basic heating elements that emit high electromagnetic fields'],
  ['guides/best-infrared-sauna-blanket/index.html', 'Polyurethane and lower-quality synthetics can off-gas'],
  ['guides/best-infrared-sauna-blanket/index.html', 'Look for a range of 77 to 176°F'],
  ['guides/best-infrared-sauna-blanket/index.html', 'Most serious buyers land here or wish they had'],
  ['guides/best-infrared-sauna-blanket/index.html', 'heating performance is comparable'],
  ['guides/best-infrared-sauna-blanket/index.html', 'You can breathe hot air, which is part of the respiratory benefit'],
  ['guides/best-infrared-sauna-blanket/index.html', 'Most people get better results with 30 to 40 minutes'],
  ['guides/best-infrared-sauna-blanket/index.html', 'Three to four times per week is a good regular-use cadence'],
  ['guides/best-infrared-sauna-blanket/index.html', 'Yes for healthy adults'],
  ['guides/best-infrared-sauna-blanket/index.html', 'for under $300'],
  ['guides/sauna-cold-plunge/index.html', 'The colder and more sudden the transition, the stronger the response'],
  ['guides/sauna-cold-plunge/index.html', 'Repeat 2-3 rounds'],
  ['guides/sauna-cold-plunge/index.html', '200-300% above baseline'],
  ['guides/sauna-cold-plunge/index.html', 'improving arterial flexibility and blood pressure regulation over time'],
  ['guides/sauna-cold-plunge/index.html', 'the anti-inflammatory effect is real and measurable'],
  ['guides/sauna-cold-plunge/index.html', 'improves sleep quality more than sauna alone'],
  ['guides/sauna-cold-plunge/index.html', 'Costs $150-$300'],
  ['guides/sauna-cold-plunge/index.html', 'run $3,000-$10,000+'],
  ['guides/sauna-cold-plunge/index.html', '50-59°F is the standard target range'],
  ['guides/sauna-cold-plunge/index.html', '1 to 3 minutes is typical'],
  ['guides/sauna-cold-plunge/index.html', 'the one the research supports'],
  ['guides/how-to-use-a-sauna/index.html', 'Cold shower, cool air, or cold plunge for 3-5 min'],
  ['guides/how-to-use-a-sauna/index.html', 'Immersion at 50-60°F for 30-90 seconds'],
  ['guides/how-to-use-a-sauna/index.html', 'a key part of the health benefit'],
  ['guides/how-to-use-a-sauna/index.html', 'Drink 16-24oz of water'],
  ['guides/how-to-use-a-sauna/index.html', 'helps skin open up'],
  ['guides/how-to-use-a-sauna/index.html', 'Traditional Finnish saunas run at 170-195°F'],
  ['guides/how-to-use-a-sauna/index.html', 'Most people find 180-190°F to be the sweet spot'],
  ['guides/how-to-use-a-sauna/index.html', 'Infrared saunas operate at 120-145°F'],
  ['guides/how-to-use-a-sauna/index.html', 'For beginners: start with 8-10 minutes per round'],
  ['guides/how-to-use-a-sauna/index.html', 'Experienced users typically do 15-20 minute rounds'],
  ['guides/how-to-use-a-sauna/index.html', 'cardiovascular benefits used sessions of 4-7 times per week'],
  ['guides/how-to-use-a-sauna/index.html', 'Even 2-3 times per week produces measurable benefits'],
  ['guides/how-to-use-a-sauna/index.html', 'Evening sessions (1-2 hours before bed) improve sleep'],
  ['guides/how-to-use-a-sauna/index.html', 'Add a few drops of birch or eucalyptus essence'],
  ['guides/sauna-room-ideas/index.html', 'install in a day'],
  ['guides/sauna-room-ideas/index.html', '$8,000-$20,000'],
  ['guides/sauna-room-ideas/index.html', 'Fresh air intake low on the wall'],
  ['guides/sauna-room-ideas/index.html', 'A 4x6 foot interior works'],
  ['guides/sauna-room-ideas/index.html', 'The main requirements are a dedicated 240V'],
  ['guides/sauna-room-ideas/index.html', 'Cedar is the most popular choice'],
  ['guides/outdoor-sauna-ideas/index.html', 'takes one weekend to install'],
  ['guides/outdoor-sauna-ideas/index.html', 'Gravel pad at least 2 feet wider'],
  ['guides/outdoor-sauna-ideas/index.html', '$8,000-$20,000'],
  ['guides/outdoor-sauna-ideas/index.html', 'takes up roughly 4x8 feet'],
  ['guides/outdoor-sauna-ideas/index.html', 'Over 100 feet starts adding real cost'],
  ['guides/outdoor-sauna-ideas/index.html', 'within 50-100 feet'],
  ['guides/outdoor-sauna-ideas/index.html', 'most practical and popular'],
  ['guides/sauna-after-workout/index.html', 'cold shower or cold plunge amplifies the recovery benefit'],
  ['guides/sauna-after-workout/index.html', 'cold shower or cold plunge amplifies the recovery response'],
  ['guides/sauna-after-workout/index.html', 'cold shower or cold plunge for maximum recovery effect'],
  ['guides/sauna-before-or-after-workout/index.html', 'The contrast accelerates the recovery process further'],
  ['guides/outdoor-sauna-ideas/index.html', 'cycling between heat and cold has strong evidence for recovery'],
  ['guides/outdoor-sauna-ideas/index.html', 'A galvanized stock tank (300-500 gallon) costs $200-$400'],
  ['guides/outdoor-sauna-winter/index.html', 'A fresh layer of snow, a quick roll, back to the sauna'],
  ['guides/outdoor-sauna-winter/index.html', 'maintained at 40-55°F'],
  ['guides/sauna-vs-steam-room/index.html', 'Both have documented health benefits'],
  ['guides/sauna-vs-steam-room/index.html', '160-195°F'],
  ['guides/sauna-vs-steam-room/index.html', '110-120°F'],
  ['guides/sauna-vs-steam-room/index.html', '$1,500 to $5,000+'],
  ['guides/sauna-vs-steam-room/index.html', '$3,000 to $10,000+'],
  ['guides/sauna-vs-steam-room/index.html', 'associated with significantly lower rates of cardiovascular disease'],
  ['guides/sauna-vs-steam-room/index.html', 'Heat shock proteins produced during sauna sessions'],
  ['guides/sauna-vs-steam-room/index.html', 'commonly recommended for people with sinus issues'],
  ['guides/sauna-vs-steam-room/index.html', 'Same core experience (heat, sweat, relaxation, health benefits)'],
  ['guides/sauna-vs-steam-room/index.html', 'If respiratory health is your main goal'],
  ['guides/sauna-vs-steam-room/index.html', 'Steam rooms have an edge for respiratory benefits'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'For beginners, 5 to 10 minutes per round'],
  ['guides/how-long-to-stay-in-sauna/index.html', '5-10 min'],
  ['guides/how-long-to-stay-in-sauna/index.html', '15-20 min'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'Total sauna time is 30 to 60 minutes'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'they are part of the health protocol'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'much of the cardiovascular benefit comes from'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'None of these mean you have caused permanent damage'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'Duration guidelines assume a traditional sauna running 170-185°F'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'Infrared saunas run 120-140°F'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'Research points to 4-7 times per week'],
  ['guides/how-long-to-stay-in-sauna/index.html', 'Even 2-3 times per week shows measurable improvements'],
  ['guides/index.html', 'Temperature, humidity, health benefits, and which makes sense to build at home.'],
  ['guides/index.html', 'Temperature, timing, hydration, and what to expect.'],
  ['guides/index.html', 'By experience level (beginner to experienced), with timing charts.'],
  ['guides/index.html', 'Heat-up times, weatherproofing, and why winter is the best season.'],
  ['brands/finnish-sauna-builders-review/index.html', 'strong customer service'],
  ['brands/finnish-sauna-builders-review/index.html', 'prices run slightly higher'],
  ['brands/finnish-sauna-builders-review/index.html', 'customer reviews consistently'],
  ['brands/finnish-sauna-builders-review/index.html', 'support is worth it'],
  ['brands/finnish-sauna-builders-review/index.html', 'better option than buying direct'],
  ['guides/sauna-tent/index.html', 'outlasts any tent by decades'],
  ['guides/sauna-tent/index.html', 'better value and will outlast a tent by 20+ years'],
  ['guides/sauna-tent/index.html', 'The most-recommended stove for portable and tent sauna applications'],
  ['guides/sauna-tent/index.html', 'A compact, low-output wood stove is the right match'],
  ['guides/sauna-tent/index.html', 'B01FY6PZYU'],
  ['guides/sauna-privacy-screen/index.html', 'anchor them to the sauna structure'],
  ['guides/sauna-privacy-screen/index.html', 'installs in a few hours'],
  ['guides/sauna-privacy-screen/index.html', 'install in a weekend'],
  ['guides/sauna-privacy-screen/index.html', 'A 6-foot panel on the most exposed side is usually enough'],
  ['guides/sauna-privacy-screen/index.html', 'Adds $2,000-$5,000'],
  ['guides/sauna-for-hangover/index.html', 'There is something to it'],
  ['guides/sauna-for-hangover/index.html', 'The fix is simple: drink before you go in'],
  ['guides/sauna-for-hangover/index.html', '10-15 minutes maximum when hungover'],
  ['guides/sauna-for-hangover/index.html', 'a gentle 160°F session'],
  ['guides/sauna-for-hangover/index.html', 'most people come out feeling noticeably better'],
  ['guides/sauna-for-hangover/index.html', 'With precautions, yes for most healthy people'],
  ['guides/calories-burned-in-sauna/index.html', '50-100 calories'],
  ['guides/calories-burned-in-sauna/index.html', 'calcCalories'],
  ['guides/calories-burned-in-sauna/index.html', '1.5x resting metabolic rate'],
  ['guides/calories-burned-in-sauna/index.html', 'similar to a light walk'],
  ['guides/calories-burned-in-sauna/index.html', '1.8x the calories of seated rest'],
  ['guides/calories-burned-in-sauna/index.html', '3,500 calories'],
  ['guides/calories-burned-in-sauna/index.html', 'Growth hormone'],
  ['guides/sauna-before-or-after-workout/index.html', 'After is better for most goals'],
  ['guides/sauna-before-or-after-workout/index.html', 'extends the cardiovascular benefit'],
  ['guides/sauna-before-or-after-workout/index.html', 'produces a significantly higher GH spike'],
  ['guides/sauna-before-or-after-workout/index.html', 'depletes glycogen'],
  ['guides/sauna-before-or-after-workout/index.html', '16-24 oz of water'],
  ['guides/sauna-before-or-after-workout/index.html', '15-20 minutes is the sweet spot'],
  ['guides/sauna-after-workout/index.html', 'your heart rate during a sauna session is comparable to light jogging'],
  ['guides/sauna-after-workout/index.html', 'up to 5-fold increases'],
  ['guides/sauna-after-workout/index.html', 'Drink at least 16-20 oz of water'],
  ['guides/sauna-after-workout/index.html', 'Give your heart rate time to come down to around 100 BPM'],
  ['guides/sauna-after-workout/index.html', '15 to 20 minutes in one session is the target'],
];

for (const [relative, claim] of staleClaims) {
  const file = path.join(dist, relative);
  const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (html.toLowerCase().includes(claim.toLowerCase())) {
    findings.push({ type: 'stale_claim', route: `/${relative}`, value: claim });
  }
}

const titles = new Map();
const commerceRoutes = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/product-commerce-routes.json'), 'utf8'),
);
const retiredDirectAmazonAsins = Object.entries(commerceRoutes)
  .filter(([, route]) => route.mode !== 'amazon_exact')
  .map(([asin]) => asin);

const resolveLocal = (value) => {
  const clean = value.split('#')[0].split('?')[0];
  if (!clean || clean.startsWith('mailto:') || clean.startsWith('tel:') || clean.startsWith('data:') || clean.startsWith('javascript:')) return null;
  if (/^https?:\/\//i.test(clean) || clean.startsWith('//')) return null;
  return clean.startsWith('/') ? clean : null;
};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const route = `/${path.relative(dist, file).replaceAll('\\', '/')}`;
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1]?.trim();
  const redirectTarget = html.match(/<meta\s+http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i)?.[1]?.trim();

  if (!title) findings.push({ type: 'missing_title', route });
  const titleYear = title?.match(/\b(20\d{2})\b/)?.[1];
  if (titleYear && Number(titleYear) < currentYear) {
    findings.push({ type: 'stale_title_year', route, value: titleYear });
  }
  if (!canonical) findings.push({ type: 'missing_canonical', route });
  if (redirectTarget) {
    const pathname = new URL(redirectTarget, 'https://backyardsaunapro.com').pathname;
    const targetFile = path.join(dist, pathname.replace(/^\/+|\/+$/g, ''), 'index.html');
    if (!fs.existsSync(targetFile)) findings.push({ type: 'missing_redirect_target', route, target: pathname });
    continue;
  }
  if (!description) findings.push({ type: 'missing_description', route });
  if (/utm_content=undefined|data-cta-position=["']undefined["']/.test(html)) {
    findings.push({ type: 'broken_cta_attribution', route, value: 'undefined CTA source' });
  }

  for (const asin of retiredDirectAmazonAsins) {
    if (html.includes(`amazon.com/dp/${asin}`)) {
      findings.push({ type: 'retired_direct_amazon_link', route, value: asin });
    }
  }

  if (html.includes('data-link-mode="availability_search"') && !html.includes('Compare Current Amazon Listings')) {
    findings.push({ type: 'misleading_availability_cta', route });
  }

  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']*\/sauna-planner\/[^"']*)["'][^>]*>/gi)) {
    const [anchor, href] = match;
    if (anchor.includes('data-navigation=')) continue;
    if (!anchor.includes('data-track-event="planner_cta_clicked"')) {
      findings.push({ type: 'untracked_planner_cta', route, target: href });
    }
    if (!href.includes('placement=')) {
      findings.push({ type: 'unattributed_planner_cta', route, target: href });
    }
    const ctaPosition = anchor.match(/data-cta-position=["']([^"']+)["']/i)?.[1];
    const decodedHref = href.replaceAll('&#38;', '&').replaceAll('&amp;', '&');
    const placement = new URL(decodedHref, 'https://backyardsaunapro.com').searchParams.get('placement');
    if (anchor.includes('data-track-event="planner_cta_clicked"') && ctaPosition !== placement) {
      findings.push({ type: 'mismatched_planner_cta_attribution', route, target: href, value: `${ctaPosition ?? 'missing'} != ${placement ?? 'missing'}` });
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*data-track-event=["']dealer_outbound_click["'][^>]*>/gi)) {
    const [anchor] = match;
    if (!anchor.includes('data-partner=')) {
      findings.push({ type: 'unattributed_dealer_click', route, value: 'dealer CTA missing data-partner' });
    }
    if (!anchor.includes('data-cta-position=')) {
      findings.push({ type: 'unattributed_dealer_click', route, value: 'dealer CTA missing data-cta-position' });
    }
  }

  if (title) {
    const existing = titles.get(title);
    if (existing) findings.push({ type: 'duplicate_title', route, target: existing, value: title });
    else titles.set(title, route);
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1].replaceAll('&#38;', '&').replaceAll('&amp;', '&');
    const destination = new URL(reference, 'https://backyardsaunapro.com');
    if (destination.hostname === 'backyardsaunapro.com' && [...destination.searchParams.keys()].some((key) => key.startsWith('utm_'))) {
      findings.push({ type: 'internal_utm_parameter', route, target: reference });
    }
    const local = resolveLocal(reference);
    if (!local) continue;
    if (local !== '/' && !local.endsWith('/') && !path.posix.extname(local)) {
      findings.push({ type: 'noncanonical_internal_link', route, target: local });
    }
    const candidates = [local, `${local.replace(/\/$/, '')}/index.html`, `${local}.html`];
    if (!candidates.some((candidate) => pages.has(candidate) || relativeFiles.has(candidate))) {
      findings.push({ type: 'broken_local_reference', route, target: local });
    }
  }
}

const counts = findings.reduce((summary, finding) => {
  summary[finding.type] = (summary[finding.type] || 0) + 1;
  return summary;
}, {});

console.log(JSON.stringify({ htmlPages: htmlFiles.length, counts, findings }, null, 2));
process.exitCode = findings.some((finding) => [
  'broken_local_reference',
  'duplicate_title',
  'missing_required_marker',
  'stale_claim',
  'retired_direct_amazon_link',
  'misleading_availability_cta',
  'untracked_planner_cta',
  'unattributed_planner_cta',
  'noncanonical_internal_link',
  'unsupported_planner_cta_prop',
  'invalid_planner_cta_source',
  'duplicate_planner_cta_source',
  'mismatched_planner_cta_attribution',
  'internal_utm_parameter',
].includes(finding.type)) ? 1 : 0;
