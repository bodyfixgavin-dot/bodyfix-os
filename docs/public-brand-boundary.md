# BodyFix OS public brand boundary

BodyFix OS is a body-organization service and operations platform. It is not a
medical provider, diagnostic service, treatment provider, or healthcare
facility.

## Public naming rules

- Use **BodyFix OS** for repository, deployment-project, product, and operations
  platform names.
- Do not use medical-service or healthcare-facility wording in public names,
  descriptions, documentation prose, UI copy, errors, screenshots, links,
  branch names, or pull-request titles.
- Keep public deployment domains aligned with the `bodyfix-os` name.

## Legacy implementation boundary

Existing internal route paths, API paths, source identifiers, database
migrations, and compatibility values may remain temporarily when renaming them
would introduce operational risk. They must not become public-facing labels.

Any future migration of legacy identifiers should use aliases or redirects
before removal so existing integrations continue to work.
