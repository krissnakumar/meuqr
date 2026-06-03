# MeuQR — Verification and Testing Checklist

Use this checklist to manually test and verify the multi-vertical SaaS features, API security, and mobile navigation layouts.

---

## 1. Onboarding & Provisioning Wizard
- [ ] **Create Account & Start Onboarding**: Sign up as a new user. Verify you are automatically redirected to the onboarding wizard.
- [ ] **Category Selector Grid**:
  - [ ] Search works to filter categories.
  - [ ] Cards display description, emojis, and icons correctly.
- [ ] **Setup Form & Questions**:
  - [ ] Selecting "Restaurante" displays restaurant questions (delivery, takeaway, food category).
  - [ ] Selecting "Material de Construção" displays material questions (quote sales, delivery, niche).
- [ ] **Seeding Verification**:
  - [ ] Complete onboarding for a "Restaurante".
  - [ ] Verify you are redirected to the dashboard.
  - [ ] In the database, check that default menu sections (e.g. Cardápio) and sample items (e.g. Pizza Marguerita, Burger Smash) have been successfully inserted.
  - [ ] In the database, check that the "orders", "menu", "whatsapp_actions" modules are enabled for this business.

---

## 2. Dashboard Navigation & Route Guards
- [ ] **Sidebar Restriction**:
  - [ ] For a "Restaurante", verify that the sidebar displays "Cardápio" and "Pedidos" but hides "Agendamentos" and "Pacientes".
  - [ ] For a "Material de Construção", verify that the sidebar displays "Produtos" and "Orçamentos" but hides "Cardápio" and "Agendamentos".
- [ ] **URL Guard Check**:
  - [ ] While logged in as a "Restaurante" owner, manually type `/dashboard/business/[id]/appointments` in the browser URL bar.
  - [ ] Verify that the page is blocked and displays the **"Módulo Não Disponível"** error page.
  - [ ] Verify that clicking the "Ir para Painel Geral" button returns you safely to the main dashboard page.

---

## 3. Public QR Page Template Renderer
- [ ] **Responsive Rendering**:
  - [ ] Open the public business page at `/[businessSlug]`.
  - [ ] Verify the layout is mobile-first and fits mobile screens without horizontal scrolling.
  - [ ] For a "Restaurante", verify the menu sections render correctly.
  - [ ] For a "Material de Construção", verify the product grid and quote request form are displayed.
- [ ] **Floating WhatsApp Action**:
  - [ ] Verify that a floating green WhatsApp button is visible at the bottom right.
  - [ ] Click it and check that it opens wa.me with a pre-filled, personalized text containing the business name.

---

## 4. Public API & Security Hardening
- [ ] **Spam Protection Check**:
  - [ ] Try to submit a quote request or order form.
  - [ ] In the network tab, inspect the request payload.
  - [ ] Modify the payload to include a value in the `honeypot` field and send the request.
  - [ ] Verify that the API rejects the request with status code `400` and message "Spam detectado."
- [ ] **Operational Scoping Checks**:
  - [ ] Try to submit an order via POST to `/api/orders` targeting a business that belongs to the "Clínica" vertical (which has orders disabled).
  - [ ] Verify that the request is rejected with status code `403` and message "O módulo de pedidos está desativado para esta empresa."
- [ ] **Plan Limits Validation**:
  - [ ] Log in as a Free plan business owner.
  - [ ] Try to create more than 10 products/services.
  - [ ] Verify that the dashboard blocks item creation and prompts you to upgrade.

---

## 5. Owner Mobile App
- [ ] **Bottom Navigation Layout**:
  - [ ] Open the mobile app.
  - [ ] Verify bottom navigation displays exactly 4 tabs: Painel, Escanear (middle circular button), Pedidos, and Ajustes.
  - [ ] Verify administrative settings/pages/members tabs are hidden.
- [ ] **QR Code Scanning**:
  - [ ] Click the center Scan button.
  - [ ] Verify camera permission is requested and code scanning functions.
