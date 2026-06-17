export default function LiveClassSection() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 text-center">
        <h2
          className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-[1.25]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Uma aula ao vivo de 3 horas onde você vai entender o bastidor real
          de quem opera o{" "}
          <span className="text-accent">um dos maiores lançamentos do Brasil</span>
          {" "}— sem filtro, sem enrolação.
        </h2>
        <p className="mt-8 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Conduzida por Luiz Filho, estrategista que já gerou mais de
          R$ 300 milhões e opera as máquinas de venda do Pablo Marçal e
          Rafa Tarso.
        </p>
      </div>
    </section>
  );
}
