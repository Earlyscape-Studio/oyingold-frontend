## This file contains important information about the current state of the project both in dev and in production



# In Prod make sure to:
- Add NEXT_PUBLIC_ROOT_DOMAIN=oyingold.com to your production env.

- In your DNS, add a record for admin.oyingold.com pointing at the same host/deployment as oyingold.com (both hostnames hit the same Next.js app — no separate deploy needed for this approach).