-- Upgrade the existing global buying guide without changing its indexed URL.
-- Commercial terms that vary by order are explicitly left for written quotation confirmation.

insert into content_articles (
  title,
  excerpt,
  content_html,
  meta_description,
  slug,
  supporting_keywords,
  faq_schema,
  article_schema,
  locale,
  status,
  published_at,
  source,
  sites,
  updated_at
) values (
  jsonb_build_object(
    'en',
    $article$Custom Knitwear Sourcing: A Buyer's Guide to RFQs, MOQ, Sampling, Quality and Shipping$article$
  ),
  jsonb_build_object(
    'en',
    $article$Prepare a comparable knitwear RFQ, verify a factory, control samples and bulk quality, and confirm packaging, payment, Incoterms and shipping before placing an order.$article$
  ),
  jsonb_build_object(
    'en',
    $article$
<p>Choosing a custom knitwear manufacturer is not only about finding the lowest unit price. A reliable order depends on whether both sides define the same product, approve the same sample, use measurable quality criteria, and agree on costs and responsibilities before production starts.</p>
<p>This guide is written for private label brands, importers, wholesalers, e-commerce sellers and buying teams sourcing sweaters, knit sets, loungewear, kidswear, pet sweaters, scarves or beanies. It gives you a practical workflow you can use with Xiuyu Knitwear or any other OEM/ODM supplier.</p>

<h2>1. Send an RFQ That Suppliers Can Price Accurately</h2>
<p>A photograph alone is rarely enough for a firm quotation. Two sweaters that look similar can use different yarn, gauge, stitch structures, finishing and packaging, resulting in very different prices. Send the following information with your request for quotation:</p>
<ul>
  <li><strong>Product and references:</strong> product type, front and back images, original sample, pattern or tech pack, and the construction details you want to copy or change.</li>
  <li><strong>Yarn requirements:</strong> preferred fiber composition, yarn count or weight, color references, hand feel and any required yarn certifications. If you are unsure, ask for suitable options rather than approving an unspecified substitute.</li>
  <li><strong>Knitting specifications:</strong> gauge, stitch pattern, jacquard or intarsia artwork, rib structures, linking method, trims and target garment weight when known.</li>
  <li><strong>Measurements:</strong> base size chart, size range, grading rules and acceptable measurement tolerances. State how each point should be measured.</li>
  <li><strong>Order quantities:</strong> total units and the quantity split by style, color and size. This lets the factory check yarn minimums and production efficiency.</li>
  <li><strong>Branding and packaging:</strong> main label, care label, size label, hangtag, barcode, polybag, carton assortment and shipping marks.</li>
  <li><strong>Market requirements:</strong> destination country, fiber and care labeling rules, product safety requirements, testing needs and any restricted substances policy.</li>
  <li><strong>Commercial requirements:</strong> target price if you have one, requested Incoterm and named place or port, destination, required delivery date and inspection plan.</li>
</ul>
<p>Ask the supplier to identify anything that is assumed rather than confirmed. A quotation that lists assumptions is easier to compare and less likely to produce unexpected charges later.</p>

<h2>2. Verify the Factory Before Discussing Only Price</h2>
<p>Supplier verification should connect the company you pay, the factory that produces your goods and the person who communicates with you. Useful evidence includes the legal company name, factory name and address, business registration, production areas, knitting and linking equipment, a live video tour, and examples of products similar to yours.</p>
<p>For higher-volume or compliance-sensitive orders, request current audit or test documentation relevant to your market and verify its scope and validity with the issuing body. Do not treat a logo on a website as proof of certification. If third-party inspection or an on-site audit is important, agree on access, timing and cost before placing the order.</p>
<p>Xiuyu Knitwear provides its factory and contact information on the <a href="/en/factory">factory page</a> and <a href="/en/contact">contact page</a>. Buyers with specific audit or documentation requirements should include them in the RFQ so the team can confirm what is available for the order.</p>

<h2>3. Understand MOQ and Compare Quotes on the Same Basis</h2>
<p>MOQ can apply to a style, color, yarn, size run or packaging component. A low garment MOQ may still be affected by dyed yarn minimums or custom label minimums. Ask whether the quoted MOQ is per style or per color and whether different sizes can be mixed.</p>
<p>Xiuyu Knitwear lists MOQs starting from 50 pieces for eligible styles. The final MOQ depends on the design, yarn, color and customization requirements, so confirm it in the written quotation rather than assuming every product has the same minimum.</p>
<p>When comparing suppliers, check that each price uses the same:</p>
<ul>
  <li>yarn composition, quality and color process;</li>
  <li>gauge, garment weight and construction;</li>
  <li>size range and quantity breakdown;</li>
  <li>sample, testing and inspection requirements;</li>
  <li>labels, hangtags, packaging and carton specifications;</li>
  <li>Incoterm, named place or port, currency and quote validity period.</li>
</ul>
<p>A lower EXW price is not directly comparable with a price that includes export handling, international freight or delivery duty. Ask what is excluded as well as what is included.</p>

<h2>4. Confirm Yarn, Gauge and Measurement Details Before Sampling</h2>
<p>Yarn selection affects cost, appearance, warmth, pilling, shrinkage and care instructions. Request yarn or swatch options when hand feel is important, and record the approved composition and color reference. For striped, jacquard or intarsia designs, confirm the artwork scale and placement on the garment rather than only on a flat drawing.</p>
<p>Gauge describes how many stitches and rows are knitted within a given measurement. Together with yarn and stitch structure, it affects garment weight, drape and fit. If you do not know the correct gauge, the factory can recommend an option from a reference sample or swatch, but the approved sample should become the production reference.</p>
<p>Your size chart should define each point of measurement, base size, grading between sizes and permitted tolerance. Also discuss shrinkage and relaxation after washing or steaming where relevant. This prevents a situation in which both parties measure the same garment differently.</p>

<h2>5. Use Sampling to Remove Production Ambiguity</h2>
<p>Different samples answer different questions. Depending on the project, you may need a prototype for construction, a fit sample for measurements, a size-set sample for grading, or a pre-production sample made with the intended bulk yarn, labels and packaging.</p>
<p>Before sampling starts, confirm the sample type, quantity, fee, freight charge, lead time and expected deliverables. Ask whether any sample fee is refundable or deductible after a bulk order and record the answer in writing. Do not assume a refund policy that has not been quoted.</p>
<p>Xiuyu Knitwear lists 3–5 days as a typical sampling reference for suitable projects. Complex patterns, special yarn, dyeing or repeated revisions can require more time. Your confirmation should include the actual schedule for your design.</p>
<p>When you receive a sample, check more than appearance:</p>
<ol>
  <li>Measure all specified points and compare them with your tolerances.</li>
  <li>Check yarn, color, stitch definition, weight, hand feel and garment symmetry.</li>
  <li>Review necklines, armholes, linking, seams, hems, buttons, zippers and embellishments.</li>
  <li>Wash or test the sample according to your intended care instructions when required.</li>
  <li>Send consolidated comments with marked images and revised measurements, then identify which version is approved.</li>
</ol>
<p>Keep one approved reference sample or a documented approval record for production and inspection. Bulk production should not rely on an outdated revision.</p>

<h2>6. Turn Quality Expectations into Inspectable Criteria</h2>
<p>“Good quality” is not a sufficient inspection standard. Define the approved sample, measurement tolerances, allowed color variation, workmanship requirements, packaging rules and defect classifications before bulk production.</p>
<p>Depending on your product and market, discuss pilling, colorfastness, dimensional stability or shrinkage, fiber content, care labeling, needle control and other required tests. Agree which laboratory or inspection company will perform them, which standard applies, who pays, and what happens if the result fails.</p>
<p>Process control can include knitted panel inspection, linking and seam checks, in-line measurement checks, final appearance inspection and packing checks. If you use AQL inspection, state the inspection level, defect categories and acceptance limits in advance. Third-party inspection should be booked early enough to allow corrective work before shipment.</p>

<h2>7. Specify Labels, Packaging and Cartons Before Bulk Production</h2>
<p>Packaging is part of the product specification, not a last-minute detail. Provide artwork and placement for main labels, care labels, size labels, hangtags and price tickets. Confirm the language, fiber composition, care symbols, country-of-origin wording and responsible-party information required in your market with your compliance adviser.</p>
<p>Also define:</p>
<ul>
  <li>individual polybag material, size, closure, warnings and recycling marks if required;</li>
  <li>folding method, tissue paper, clips, hangers or other accessories;</li>
  <li>units per carton and color-size assortment;</li>
  <li>barcode type and carton shipping marks;</li>
  <li>carton dimensions, gross weight and any pallet requirements.</li>
</ul>
<p>Carton dimensions and weights are also needed for accurate freight quotes, especially for air freight and courier shipments charged by volumetric weight.</p>

<h2>8. Put Payment and Incoterms in the Written Order</h2>
<p>Before paying, verify the beneficiary name and payment instructions through a trusted communication channel. The proforma invoice or sales contract should state the currency, total amount, payment method, deposit and balance schedule, bank charges, and any relationship between inspection, shipping documents and the balance payment.</p>
<p>Available payment methods and terms can vary by customer and order. Confirm them directly with Xiuyu Knitwear in the written quotation; this guide does not assume a particular deposit percentage, payment platform or credit arrangement.</p>
<p>Xiuyu Knitwear's published factory information lists FOB, CIF and DDP options. Confirm availability for your shipment and always write the Incoterm together with the named port or place and the applicable Incoterms version. Make sure you understand who pays for export handling, main carriage, insurance, import clearance, duties, taxes and final delivery.</p>

<h2>9. Choose Express, Air or Sea Freight from Real Constraints</h2>
<p>Express is useful for samples and small urgent shipments. Air freight can suit higher-volume urgent orders, while sea freight is often more economical for bulky cartons when the schedule allows. Compare total landed cost and timing rather than freight rate alone.</p>
<p>Your shipping plan should confirm carton count, dimensions and weights, ready date, departure and arrival estimates, destination charges, customs documents and consignee details. ETD is the estimated departure; it is not the delivery date at your warehouse. Allow time for export handling, customs, possible inspections and final delivery.</p>
<p>For DDP or other delivered orders, clarify the delivery address, unloading requirements, appointment rules and who handles import declarations. For FOB or CIF orders, coordinate with your own freight forwarder before cargo is ready.</p>

<h2>10. Protect Reorder Consistency</h2>
<p>A successful first order should become a controlled specification for the next one. Keep the approved sample or golden sample record, final tech pack, yarn and color references, size chart, artwork versions, packaging details and inspection results. Record any approved deviations.</p>
<p>For a repeat order, confirm that the factory is using the latest revision. Ask whether yarn lots, color shades, components or production conditions have changed, and approve a new pre-production reference when the change could affect appearance or performance. Do not assume that a previous purchase order number alone defines the new order.</p>

<h2>A Practical RFQ Template for Xiuyu Knitwear</h2>
<p>You can copy this checklist into your inquiry:</p>
<ol>
  <li>Product type and reference images or tech pack.</li>
  <li>Preferred yarn, gauge, colors and target hand feel.</li>
  <li>Base size chart, size range and measurement tolerances.</li>
  <li>Quantity per style, color and size.</li>
  <li>Label, hangtag, packaging and barcode requirements.</li>
  <li>Destination country and any testing or compliance requirements.</li>
  <li>Requested sample type, target delivery date and inspection plan.</li>
  <li>Requested Incoterm, named port or delivery address.</li>
</ol>
<p>Send these details through the <a href="/en/contact">Xiuyu Knitwear inquiry form</a> or email <a href="mailto:info@xiuyuknit.com">info@xiuyuknit.com</a>. The team can then confirm suitable yarn and construction options, MOQ, sampling, pricing and the schedule for your specific order. You can also review the <a href="/en/products">current knitwear product range</a> for reference styles.</p>

<h2>Frequently Asked Questions</h2>
<h3>What is Xiuyu Knitwear's MOQ?</h3>
<p>MOQs start from 50 pieces for eligible styles. The final minimum can depend on the design, yarn, color and customization requirements, so ask for confirmation per style and color in your quotation.</p>

<h3>How long does sampling take?</h3>
<p>The published reference is 3–5 days for suitable projects. Special yarn, dyeing, complex stitches and revisions can extend this timing. Confirm the actual sample schedule before development starts.</p>

<h3>Are sample fees refundable?</h3>
<p>Sample charges and any refund or bulk-order deduction must be confirmed for each project. Ask for the rule in writing before paying, including any conditions and courier costs.</p>

<h3>Which payment methods are available?</h3>
<p>Payment methods, currency, deposit and balance terms are confirmed in the quotation or proforma invoice. Verify the beneficiary and payment instructions before sending funds.</p>

<h3>Can Xiuyu Knitwear ship under FOB, CIF or DDP?</h3>
<p>These options are listed in the factory information, but availability and cost depend on the shipment. Confirm the named port or place, Incoterms version, included charges and import responsibilities in writing.</p>

<h3>How can I keep repeat orders consistent?</h3>
<p>Use the latest approved tech pack, reference sample, yarn and color details, size chart, artwork and packaging specification. Reconfirm any changed material or component before bulk production.</p>
$article$
  ),
  jsonb_build_object(
    'en',
    $article$A practical custom knitwear sourcing guide covering RFQs, MOQ, sampling, quality control, packaging, payments, Incoterms, shipping and repeat orders.$article$
  ),
  'xiuyu-knitwear-buyingguide',
  array[
    'custom knitwear manufacturer',
    'knitwear RFQ checklist',
    'sweater MOQ',
    'knitwear sampling',
    'knitwear quality control',
    'private label knitwear packaging',
    'FOB CIF DDP knitwear',
    'knitwear repeat orders'
  ]::text[],
  jsonb_build_object(
    '@context', 'https://schema.org',
    '@type', 'FAQPage',
    'mainEntity', jsonb_build_array(
      jsonb_build_object(
        '@type', 'Question',
        'name', 'What is Xiuyu Knitwear''s MOQ?',
        'acceptedAnswer', jsonb_build_object(
          '@type', 'Answer',
          'text', 'MOQs start from 50 pieces for eligible styles. The final minimum can depend on the design, yarn, color and customization requirements, so confirm it per style and color in the quotation.'
        )
      ),
      jsonb_build_object(
        '@type', 'Question',
        'name', 'How long does sampling take?',
        'acceptedAnswer', jsonb_build_object(
          '@type', 'Answer',
          'text', 'The published reference is 3–5 days for suitable projects. Special yarn, dyeing, complex stitches and revisions can extend this timing, so confirm the actual sample schedule before development starts.'
        )
      ),
      jsonb_build_object(
        '@type', 'Question',
        'name', 'Are sample fees refundable?',
        'acceptedAnswer', jsonb_build_object(
          '@type', 'Answer',
          'text', 'Sample charges and any refund or bulk-order deduction must be confirmed for each project. Ask for the rule in writing before paying, including any conditions and courier costs.'
        )
      ),
      jsonb_build_object(
        '@type', 'Question',
        'name', 'Which payment methods are available?',
        'acceptedAnswer', jsonb_build_object(
          '@type', 'Answer',
          'text', 'Payment methods, currency, deposit and balance terms are confirmed in the quotation or proforma invoice. Verify the beneficiary and payment instructions before sending funds.'
        )
      ),
      jsonb_build_object(
        '@type', 'Question',
        'name', 'Can Xiuyu Knitwear ship under FOB, CIF or DDP?',
        'acceptedAnswer', jsonb_build_object(
          '@type', 'Answer',
          'text', 'These options are listed in the factory information, but availability and cost depend on the shipment. Confirm the named port or place, Incoterms version, included charges and import responsibilities in writing.'
        )
      ),
      jsonb_build_object(
        '@type', 'Question',
        'name', 'How can I keep repeat orders consistent?',
        'acceptedAnswer', jsonb_build_object(
          '@type', 'Answer',
          'text', 'Use the latest approved tech pack, reference sample, yarn and color details, size chart, artwork and packaging specification. Reconfirm any changed material or component before bulk production.'
        )
      )
    )
  ),
  jsonb_build_object(
    'author', jsonb_build_object('@type', 'Organization', 'name', 'Xiuyu Knitwear'),
    'about', array[
      'Custom knitwear manufacturing',
      'Knitwear sourcing',
      'OEM and ODM sweaters',
      'Knitwear quality control'
    ]::text[]
  ),
  'en',
  'published',
  now(),
  'manual',
  array['global']::text[],
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content_html = excluded.content_html,
  meta_description = excluded.meta_description,
  supporting_keywords = excluded.supporting_keywords,
  faq_schema = excluded.faq_schema,
  article_schema = excluded.article_schema,
  locale = 'en',
  status = 'published',
  published_at = coalesce(content_articles.published_at, now()),
  source = 'manual',
  sites = array['global']::text[],
  updated_at = now();
