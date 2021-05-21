// SPDX-License-Identifier: GPL-2.0-or-later
// SPDX-FileCopyrightText: Copyright 2020 Michael Karl Franzl <public.michael@franzl.name>

import Base from './base.js';

class Sign extends Base {
  constructor() {
    super();

    this.segmentMap = {
      a: 'segment_a',
      b: 'segment_b',
      c: 'segment_c',
    };

    this.svgFilepath = `${this.path}/sign.svg`;
    this.initialize();
  }
}

customElements.define('dsky-display-sign', Sign);
