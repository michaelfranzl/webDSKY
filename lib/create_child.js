// SPDX-License-Identifier: GPL-2.0-or-later
// SPDX-FileCopyrightText: Copyright 2020 Michael Karl Franzl <public.michael@franzl.name>

export default function createChild(parent, tag, { classes = [], id, attributes = {} } = {}) {
  const element = document.createElement(tag);
  for (const clss of classes) element.classList.add(clss);
  Object.assign(element, attributes);
  if (id) element.id = id;
  parent.appendChild(element);
  return element;
}
