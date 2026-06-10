// Pure server component — emits a structured-data script tag with no client JS.
type JsonLdProps = {
  data: Record<string, unknown>;
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Escape `<` so no value can ever form a `</script>` that terminates
      // this tag early (standard JSON-in-script hardening; valid JSON either way).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
