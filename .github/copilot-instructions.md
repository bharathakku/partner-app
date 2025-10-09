# Copilot Instructions for partner-app

## Project Overview
- **Framework**: Next.js 15, React 19, Tailwind CSS
- **Purpose**: Demo and implementation of a delivery partner order management system, simulating the full lifecycle from order acceptance to payment and bank transfer.
- **Mobile-first**: All UI/UX is optimized for mobile delivery partners.

## Architecture & Key Patterns
- **App Directory Structure**: Uses Next.js app directory routing (`app/`).
- **State Management**: Centralized via React Contexts (`app/contexts/OrderContext.js`, `app/contexts/ProfileContext.js`).
- **Order Data**: Demo orders and route logic in `app/data/dummyOrders.js`.
- **Order Flow**: Each order step is a separate route/page under `app/orders/` (e.g., `/orders/pickup`, `/orders/complete`).
- **Order Receiving**: Core logic in `components/OrderReceiving.js` and `app/services/notificationService.js` (sound, vibration, notifications).
- **Route Optimization**: Haversine formula and route grouping in `dummyOrders.js` and related logic.
- **Earnings/Wallet**: Managed in `app/dashboard/earnings/` and `app/dashboard/wallet/`.
- **Payment Handling**: UPI and Cash on Delivery flows are both simulated.

## Developer Workflows
- **Start Dev Server**: `npm run dev` (uses Next.js Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **No built-in tests**: (add tests as needed)
- **Demo Reset**: Refresh `/` and click "Start Taking Orders" to reset demo state.

## Project-Specific Conventions
- **Order Limit**: Max 2 orders per route, enforced in logic and UI.
- **Dual Order Mode**: Special UI/logic for handling two orders on the same route.
- **30s Response Timer**: Orders must be accepted/declined within 30 seconds.
- **Priority Alerts**: Sound/vibration/notification patterns based on order urgency (see `notificationService.js`).
- **Route Optimization**: Orders are always arranged by nearest-first delivery.
- **Checklists**: All critical steps (pickup, delivery) require interactive checklist completion.
- **Photo Capture**: Simulated via `components/CameraCapture.js`.

## Integration Points
- **WebSocket Ready**: Structure in place for real-time order notifications (see `ORDER_RECEIVING_README.md`).
- **API Endpoints**: Placeholder endpoints for order actions (accept/decline, status, optimization).

## Key Files & Directories
- `app/contexts/OrderContext.js` – Order state logic
- `app/data/dummyOrders.js` – Demo order data & route logic
- `components/OrderReceiving.js` – Order popup, dual order, timer
- `app/services/notificationService.js` – Alerts (sound, vibration, notifications)
- `app/orders/` – Order flow pages
- `app/dashboard/earnings/`, `app/dashboard/wallet/` – Earnings and wallet logic
- `components/CameraCapture.js` – Photo simulation
- `ORDER_RECEIVING_README.md`, `DEMO_GUIDE.md` – In-depth architecture and flow docs

## Examples
- To add a new order step: create a new page under `app/orders/` and update order state transitions in `OrderContext.js`.
- To change alert patterns: edit `app/services/notificationService.js`.
- To update demo data: modify `app/data/dummyOrders.js`.

## References
- See `ORDER_RECEIVING_README.md` and `DEMO_GUIDE.md` for detailed flow, architecture, and technical notes.

---
For any unclear or missing conventions, review the above files or ask for clarification.