# MeuQR — Mobile App Repositioning

This document outlines the mobile app positioning as an Owner Quick App rather than a full administrative console mirroring the web dashboard.

## 1. Product Positioning

The mobile app is optimized for business owners to use on the go:
* **Immediate Response**: Focus on push notifications and quick replies to orders, quotes, and appointments.
* **In-Store QR Scanning**: Designed to scan client tickets, verify appointment status, or quickly preview pages.
* **Compact Management**: View daily metrics and manage settings without catalog layout adjustments.

---

## 2. Navigational Tab Map

Administrative tabs have been hidden from the bottom navigation (`href: null` in Expo Router TabLayout) to keep the layout compact and clean.

The 4 primary bottom tab sections are:

1. **Painel (Home)**: Daily analytics (visits, clicks), active alerts, and recent activities.
2. **Escanear (Scanner)**: Large scan button positioned in the center, calling the device camera to read MeuQR codes.
3. **Pedidos (Orders/Quotes)**: Real-time list of customer orders, quote requests, and bookings.
4. **Ajustes (Settings)**: Basic profile options, notification settings, and logout action.

---

## 3. UX Guidelines

To support Brazilian business owners on-site:
- **Large Touch Targets**: Button tap areas are at least 48dp to prevent misclicks on mobile.
- **Portuguese-First**: The user interface is translated and uses direct, non-technical Brazilian Portuguese labels.
- **Offline Caching**: Caches the last loaded stats/alerts locally, allowing the owner to view information even in areas with weak cellular connection (e.g. inside thick-walled warehouses or storage rooms).
