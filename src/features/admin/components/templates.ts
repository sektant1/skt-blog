export function postTemplate() {
  const today = new Date().toISOString().slice(0, 10);
  return `---
title: "Untitled Post"
slug: "untitled-post"
description: "Short description."
date: "${today}"
updated: "${today}"
published: false
draft: true
tags: []
featured: false
---

## Notes

Draft body.
`;
}

export function projectTemplate() {
  const today = new Date().toISOString().slice(0, 10);
  return `---
title: "Untitled Project"
slug: "untitled-project"
description: "Short project summary."
date: "${today}"
updated: "${today}"
published: false
draft: true
tags: []
techStack: []
media: []
featured: false
status: "experiment"
---

## README

What it is, why it exists, and what changed.
`;
}
