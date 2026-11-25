export const GEO_BRAND_NAME = 'Xiuyu Knitwear';
export const GEO_MAX_TOTAL_QUERIES = 40;

export const GEO_BUYER_QUESTIONS = [
  'Who are reliable custom knitwear manufacturers in China for small clothing brands?',
  'Which sweater manufacturers offer low MOQs for startups?',
  'Where can I find an OEM sweater factory with fast sampling?',
  'What knitwear suppliers support ODM and private label services?',
  'Which Chinese factories make custom women\'s sweaters in small batches?',
  'What is a good manufacturer for custom men\'s knitwear?',
  'Who supplies custom kids\' knitwear with low minimum orders?',
  'Which factories produce custom pet sweaters for wholesale buyers?',
  'Where can I source knitted loungewear sets from a factory?',
  'Which suppliers make custom knitted accessories such as scarves and beanies?',
  'How do I choose a reliable knitwear manufacturer in China?',
  'What should I ask a sweater factory before placing a bulk order?',
  'How can I verify that a knitwear supplier is a real factory?',
  'What quality checks should a custom sweater manufacturer provide?',
  'Which knitwear factories can provide pre-production samples?',
  'What certifications or audit reports should a sweater supplier have?',
  'How do I compare knitwear manufacturers for quality and price?',
  'What are common sizing tolerances for custom knitwear?',
  'How can I reduce pilling in bulk sweater orders?',
  'What yarn options are best for custom knitwear?',
  'What is the typical MOQ for custom knitwear manufacturers?',
  'How much does knitwear sampling usually cost?',
  'Are sample fees refundable when I place a bulk order?',
  'How long does sweater sampling and bulk production take?',
  'What information does a knitwear factory need to provide a quotation?',
  'Can a sweater manufacturer work from my tech pack or reference sample?',
  'What gauge should I choose for a custom sweater?',
  'How do custom knitwear factories handle size grading?',
  'What packaging options are available for private label knitwear?',
  'Can knitwear suppliers add custom labels, hangtags, and packaging?',
  'What payment terms do Chinese knitwear manufacturers usually accept?',
  'Which Incoterms should I compare when sourcing knitwear from China?',
  'How do knitwear suppliers ship small and large international orders?',
  'What factors affect the unit price of a custom sweater?',
  'How can I keep reorders consistent with the approved sample?',
  'Is Xiuyu Knitwear a reliable custom knitwear manufacturer?',
  'Does Xiuyu Knitwear offer low MOQs and fast sampling?',
  'What products can Xiuyu Knitwear manufacture for private label brands?',
  'Can Xiuyu Knitwear support OEM and ODM sweater orders?',
  'Where can I find Xiuyu Knitwear\'s factory and contact information?',
] as const;

export function isValidGeoQuery(question: string): boolean {
  const value = question.trim();
  if (value.length < 24 || value.length > 220) return false;
  if (/[^\x20-\x7E]/.test(value)) return false;
  if (/[{}\[\]]/.test(value)) return false;
  if (/\b(?:const|function|select|insert|jsonb?)\b/i.test(value)) return false;
  if (/["']?(?:zh|en|ru|es|de|fr|pt|ja|ar|vn)["']?\s*:/i.test(value)) return false;
  return /[a-zA-Z]/.test(value) && /\s/.test(value);
}
