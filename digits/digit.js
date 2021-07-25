// SPDX-License-Identifier: GPL-2.0-or-later
// SPDX-FileCopyrightText: Copyright 2020 Michael Karl Franzl <public.michael@franzl.name>

import Base from './base.js';

class Digit extends Base {
  constructor() {
    super();

    this.segmentMap = {
      e: 'segment_e',
      f: 'segment_f',
      h: 'segment_h',
      j: 'segment_j',
      k: 'segment_k',
      m: 'segment_m',
      n: 'segment_n',
    };

    this.svgFilepath = new URL('./digit.svg', import.meta.url);
    this.initialize();
  }
}

customElements.define('dsky-display-digit', Digit);
