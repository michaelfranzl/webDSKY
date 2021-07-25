// SPDX-License-Identifier: GPL-2.0-or-later
// SPDX-FileCopyrightText: Copyright 2020 Michael Karl Franzl <public.michael@franzl.name>

export default class Base extends HTMLElement {
  constructor() {
    super();

    this.root = this.attachShadow({ mode: 'closed' });

    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', new URL('./style.css', import.meta.url).href);
    this.root.appendChild(linkElem);
  }

  setSegments(labels) {
    if (!this.initialized) return;

    Object.keys(this.segmentMap).forEach((label) => {
      const segment = this.segments[label];
      if (labels.indexOf(label) === -1) segment.classList.remove('on');
      else segment.classList.add('on');
    });
  }

  async initialize() {
    const response = await fetch(this.svgFilepath);
    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = doc.documentElement;
    this.root.appendChild(svgElement);

    this.segments = [];
    for (const [label, id] of Object.entries(this.segmentMap))
      this.segments[label] = this.root.getElementById(id);

    this.initialized = true;
  }

  attributeChangedCallback(_attrName, _oldVal, newVal) {
    if (newVal === null) return;

    this.setSegments(newVal);
  }

  static get observedAttributes() {
    return ['segments'];
  }
}
