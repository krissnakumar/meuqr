# MeuQR — Modules Registry

This document lists the official modules supported in the MeuQR Business OS platform.

## 1. Core Modules (Always Active)

These modules form the foundation of any business workspace and cannot be disabled:

| Module Key | Friendly Name | Description | Icon |
| :--- | :--- | :--- | :--- |
| `overview` | Painel Geral | Business performance stats, scan activity, and action shortcuts. | `LayoutDashboard` |
| `pages` | Páginas QR | Public-facing page editor and navigation tree links. | `FileText` |
| `qr_codes` | QR Codes | Code generator for tables, counters, flyer placements. | `QrCode` |
| `whatsapp_actions` | WhatsApp | Floting WhatsApp button configuration and quick replies. | `MessageCircle` |
| `inbox` | Mensagens (Inbox) | Chat messages, guest inquiries, and leads. | `MessageSquare` |
| `customers` | Clientes & Leads | Customer records, CRM, and activity logs. | `Users` |
| `analytics` | Métricas | Click events, scans, and conversion rates. | `BarChart3` |
| `settings` | Configurações | Location info, branding colors, opening hours. | `Settings` |

---

## 2. Optional / Industry Modules (Scoped by Vertical)

These modules are enabled selectively depending on the business category:

| Module Key | Friendly Name | Description | Icon |
| :--- | :--- | :--- | :--- |
| `products` | Catálogo de Produtos | For retail, construction, and shops to list items. | `Package` |
| `services` | Serviços | For clinics, salons, and service providers to list services. | `Briefcase` |
| `menu` | Cardápio Digital | For restaurants, cafes, and bars to show food menus. | `UtensilsCrossed` |
| `orders` | Pedidos | Allows ordering from pages ( mesa/delivery ). | `ShoppingCart` |
| `quote_requests` | Orçamentos | Custom request for materials or custom service prices. | `ClipboardList` |
| `appointments` | Agendamentos | Online time slots booking for salons, doctors, mechanics. | `Calendar` |
| `leads` | Captura de Leads | General interest forms (e.g. Real Estate properties). | `UserPlus` |
| `patients` | Pacientes | Scoped clinical charts for dentists and clinics. | `HeartPulse` |

---

## 3. Future & Advanced Modules (Hidden)

Behind `ENABLE_ADVANCED_MODULES=false` feature flag:
- `courses` (Online Courses)
- `hotel_concierge` (Hotel Rooms Concierge)
- `loyalty` (Virtual Stamp Card)
- `coupons` (Discount Coupons)
