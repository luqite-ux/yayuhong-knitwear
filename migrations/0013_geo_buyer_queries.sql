do $$
declare
  target_project_id uuid;
  invalid_id uuid;
  candidate text;
  candidates text[] := array[
    'Who are reliable custom knitwear manufacturers in China for small clothing brands?',
    'Which sweater manufacturers offer low MOQs for startups?',
    'Where can I find an OEM sweater factory with fast sampling?',
    'What knitwear suppliers support ODM and private label services?',
    'Which Chinese factories make custom women''s sweaters in small batches?',
    'What is a good manufacturer for custom men''s knitwear?',
    'Who supplies custom kids'' knitwear with low minimum orders?',
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
    'Where can I find Xiuyu Knitwear''s factory and contact information?'
  ];
begin
  select id into target_project_id
  from geo_projects
  where domain in ('xiuyuknit.com', 'www.xiuyuknit.com')
  order by created_at
  limit 1;

  if target_project_id is null then
    return;
  end if;

  update geo_projects
  set brand_name = 'Xiuyu Knitwear', updated_at = now()
  where id = target_project_id;

  foreach candidate in array candidates loop
    if exists (
      select 1 from geo_queries
      where project_id = target_project_id and lower(question) = lower(candidate)
    ) then
      continue;
    end if;

    select q.id into invalid_id
    from geo_queries q
    where q.project_id = target_project_id
      and (
        length(btrim(q.question)) < 24
        or length(btrim(q.question)) > 220
        or q.question ~ '[{}\[\]]'
        or q.question ~ '[^ -~]'
        or lower(q.question) ~ '"(zh|en|ru|es|de|fr|pt|ja|ar|vn)"[[:space:]]*:'
        or lower(q.question) ~ '\m(const|function|select|insert|jsonb?)\M'
      )
    order by q.created_at, q.id
    limit 1;

    if invalid_id is not null then
      update geo_queries
      set question = candidate, enabled = true
      where id = invalid_id;
      invalid_id := null;
    elsif (select count(*) from geo_queries where project_id = target_project_id) < 40 then
      insert into geo_queries (project_id, question, enabled)
      values (target_project_id, candidate, true);
    end if;
  end loop;
end $$;
