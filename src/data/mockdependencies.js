export const nodes = [
  { id: "auth.routes.js" },
  { id: "auth.controller.js" },
  { id: "user.service.js" },
  { id: "user.model.js" },
];

export const links = [
  { source: "auth.routes.js", target: "auth.controller.js" },
  { source: "auth.controller.js", target: "user.service.js" },
  { source: "user.service.js", target: "user.model.js" },
];