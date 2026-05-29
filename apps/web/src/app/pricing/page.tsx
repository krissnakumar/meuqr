import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "Preços - MeuQR | Planos para seu negócio",
  description:
    "Escolha o plano ideal para seu negócio. De restaurantes a clínicas, tenha sua página inteligente com QR code personalizado.",
};

const plans = [
  {
    name: "Grátis",
    nameEn: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para começar",
    features: [
      "1 negócio",
      "1 QR code",
      "Até 20 itens",
      "QR code básico",
      "Página pública",
      "Suporte por email",
    ],
    cta: "Começar grátis",
    href: "/register",
    popular: false,
  },
  {
    name: "Pro",
    nameEn: "Pro",
    price: "R$ 29",
    period: "/mês",
    description: "Para negócios em crescimento",
    features: [
      "Até 3 negócios",
      "QR codes ilimitados",
      "Até 500 itens",
      "QR code personalizado",
      "Analytics completos",
      "Upload de logo e fotos",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    href: "/register?plan=pro",
    popular: true,
  },
  {
    name: "Business",
    nameEn: "Business",
    price: "R$ 79",
    period: "/mês",
    description: "Para empresas e redes",
    features: [
      "Negócios ilimitados",
      "QR codes ilimitados",
      "Itens ilimitados",
      "QR code personalizado",
      "Analytics avançados",
      "Múltiplos funcionários",
      "API access",
      "Suporte 24h",
    ],
    cta: "Falar com vendas",
    href: "/register?plan=business",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#111827] mb-4">
            Planos Simples e Transparentes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para seu negócio. Cancele quando quiser, sem
            multas ou taxas escondidas.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-[#00C853] shadow-[#00C853]/10 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#00C853] text-white text-xs font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#111827] mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#111827]">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#00C853] shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? "bg-[#00C853] text-white hover:bg-[#00B84A]"
                    : "bg-gray-100 text-[#111827] hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Posso mudar de plano depois?",
                a: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. A diferença é calculada proporcionalmente.",
              },
              {
                q: "Preciso de cartão de crédito?",
                a: "Não para o plano Grátis! Nos planos pagos, aceitamos cartão de crédito e PIX via Mercado Pago.",
              },
              {
                q: "O que acontece se eu cancelar?",
                a: "Seu acesso continua até o final do período já pago. Depois, seu plano volta para Grátis automaticamente.",
              },
              {
                q: "Tem suporte em português?",
                a: "Sim! Nosso suporte é 100% em português, por email e WhatsApp.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <h3 className="font-semibold text-[#111827] mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-[#111827] text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Comece Grátis Hoje
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Crie sua primeira página inteligente em menos de 5 minutos. Sem
            compromisso.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#00C853] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#00B84A] transition-colors text-lg"
          >
            Criar Conta Grátis
          </Link>
        </div>
      </div>
    </div>
  );
}
