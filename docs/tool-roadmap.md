# Buyer Tool Roadmap

| Rank | Tool | Buyer usefulness | Effort | Maintenance | Lead potential | Affiliate potential | Decision |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | Electricity-cost estimator | High | Low | Low | Medium | Medium | Implemented locally |
| 2 | Total project-budget planner | Very high | Medium | Low | High | High | Implemented locally with user-entered quotes only |
| 3 | Sauna project brief planner | High | Medium | Low | High | Medium | Implemented locally without storage or automatic sharing |
| 4 | Sauna size planner | High | Medium | Medium | High | High | Prototype with conservative outputs |
| 5 | Heater-sizing calculator | High | Medium | High | High | High | Require manufacturer-rule research and strong safety gates |
| 6 | Product comparison builder | Very high | High | Very high | High | Very high | Build only after product data has an owner and update process |

## First-tool contract

The electricity-cost estimator accepts heater wattage, electricity rate, session length, sessions per week, and optional warm-up time. It shows the formula, monthly and annual estimates, and editable assumptions. It must not imply that the heater runs at full power continuously or that the result is a utility quote.

Events: `calculator_started` on first input and `calculator_completed` when a valid estimate renders. Parameters: tool name, input ranges, result range, page path, and CTA location. Do not send exact household identifiers.

## Implemented project-budget contract

The project-cost calculator accepts user-entered amounts for the sauna package, freight, tax, permits, foundation, utilities, installation, weather protection, access, and accessories. It adds an editable contingency and explicitly lists blank categories as unknown. It does not supply or imply market prices.

The project brief planner collects project categories in the browser, creates a local text summary, and does not submit or store answers. The visitor must explicitly copy the brief or open a prefilled email. Analytics excludes ZIP and free text.

## Safety constraints

- A sauna planner is a planning aid, not engineering, permit, electrical, or safety approval.
- Heater sizing must defer to manufacturer instructions and qualified installers.
- All calculations must show formulas and assumptions.
- Product recommendations require maintained source data and review dates.
