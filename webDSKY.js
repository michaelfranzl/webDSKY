// SPDX-License-Identifier: GPL-2.0-or-later
// SPDX-FileCopyrightText: Copyright 2020 Michael Karl Franzl <public.michael@franzl.name>

import './digits/digit.js';
import './digits/sign.js';
import createChild from './lib/create_child.js';

/*
 * Element naming follows the prints at
 * https://archive.org/stream/acelectroniclmma00acel_0#page/n344/mode/1up
 */
class DskyInterface extends HTMLElement {
  constructor() {
    super();

    this.setPath();

    this.state = {
      sign1m: 0,
      sign1p: 0,
      sign2m: 0,
      sign2p: 0,
      sign3m: 0,
      sign3p: 0,
    };

    const root = this.attachShadow({ mode: 'closed' });

    createChild(root, 'link', {
      attributes: { rel: 'stylesheet', href: `${this.path}/webDSKY.css` },
    });
    const iface = createChild(root, 'div', { classes: ['interface'] });
    createChild(iface, 'div', { classes: ['overlay'] });
    createChild(iface, 'div', { classes: ['digitContainer', 'blur'] });
    const digitContainer = createChild(iface, 'div', { classes: ['digitContainer'] });

    this.elements = {
      ds1: {}, // right side
      ds2: {}, // left side
      keys: {},
    };

    // create 3 rows of 5 digits each
    for (let row = 1; row <= 3; row++) {
      const div = createChild(digitContainer, 'div', { classes: ['digitRow', `row${row}`] });
      createChild(div, 'div', { classes: ['separator'] });
      this.elements.ds1[`${row}sign`] = createChild(div, 'dsky-display-sign');
      for (let digit = 5; digit >= 1; digit--)
        this.elements.ds1[`${row}${digit}`] = createChild(div, 'dsky-display-digit');
    }

    // create verb, noun, prog digits
    for (const row of [4, 5, 7]) {
      const div = createChild(digitContainer, 'div', { classes: ['digitRow', `row${row}`] });
      for (let digit = 1; digit <= 2; digit++)
        this.elements.ds1[`${row}${digit}`] = createChild(div, 'dsky-display-digit');
    }

    // create verb, noun, prog backlights
    for (const id of ['prog', 'verb', 'noun'])
      createChild(digitContainer, 'div', { classes: [`${id}_bg`] });

    // create COMP ACTY backlight
    this.elements.ds1.comp_acty = createChild(digitContainer, 'div', { classes: ['acty_bg'] });
    this.elements.ds1.comp_acty.style.display = 'none';

    // create 7 rows and 2 columns of alarm indicator lights
    const lampContainer = createChild(root, 'div', { id: 'lamps' });
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 2; col++) {
        const id = `lamp${row}${col}`;
        this.elements.ds2[id] = createChild(lampContainer, 'div', { id, classes: ['lamp'] });
      }
    }

    // Create keys.
    // p = plus, m = minus, o = proceed, e = enter, k = key release, c = clr, r = rset
    // v = verb, n = noun
    const keys = '0123456789pmvncpkero';
    for (const key of keys) {
      const element = this.elements.keys[key] = createChild(root, 'div', {
        id: `key_${key}`,
        classes: ['key'],
      });

      element.setAttribute('char', key);

      element.addEventListener('mousedown', (event) => {
        const char = event.target.getAttribute('char');
        if (char === 'o')
          this.dispatchEvent(new CustomEvent('proceed', { detail: 0 }));
        else
          this.dispatchEvent(new CustomEvent('keypress', { detail: DskyInterface.keyToValue(char) }));
      });

      element.addEventListener('mouseup', (event) => {
        const char = event.target.getAttribute('char');

        if (char === 'o') {
          if (this.mouseupTimeoutProceedKey)
            clearTimeout(this.mouseupTimeoutProceedKey);
          this.mouseupTimeoutProceedKey = setTimeout(() => {
            this.dispatchEvent(new CustomEvent('proceed', { detail: 1 }));
          }, 250); // T4RUPT in Apollo programs checks the PRO key every 120 ms

        } else {
          if (this.mouseupTimeoutNormalKey)
            clearTimeout(this.mouseupTimeoutNormalKey);
          this.mouseupTimeoutNormalKey = setTimeout(() => {
            this.dispatchEvent(new CustomEvent('keypress', { detail: 0 }));
          }, 250);
        }
      });
    }
  }

  setPath() {
    const parts = new URL(import.meta.url).pathname.split('/');
    parts.pop();
    this.path = parts.join('/');
  }

  emit(port, value) {
    this.dispatchEvent(new CustomEvent('output', { detail: { port, value } }));
  }

  static keyToValue(button) {
    switch (button.toLowerCase()) {
      case '1': return 1;
      case '2': return 2;
      case '3': return 3;
      case '4': return 4;
      case '5': return 5;
      case '6': return 6;
      case '7': return 7;
      case '8': return 8;
      case '9': return 9;
      case '0': return 16;
      case 'v': return 17; // verb
      case 'r': return 18; // reset
      case 'k': return 25; // key rel
      case 'p': return 26;
      case 'm': return 27;
      case 'e': return 28;
      case 'c': return 30; // clear
      case 'n': return 31; // noun
      default: return null;
    }
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'data-input1') {
      const value = parseInt(newVal, 2);
      this.handleDigitUpdate(value);

    } else if (attrName === 'data-input2') {
      const value = parseInt(newVal, 2);
      this.handleLampsUpdate(value);

    } else if (attrName === 'data-keypress') {
      if (!oldVal && !newVal) return;

      if (!oldVal && newVal) { // emulates keydown
        const key = newVal.toLowerCase();
        const element = this.elements.keys[key];
        if (!element) return;

        element.dispatchEvent(new Event('mousedown'));
        element.classList.add('pressed');

      } else if (oldVal && !newVal) { // emulates keyup
        const key = oldVal.toLowerCase();
        const element = this.elements.keys[key];
        if (!element) return;

        element.dispatchEvent(new Event('mouseup'));
        element.classList.remove('pressed');
      }
    }
  }

  handleLampsUpdate(value) {
    // I don't know yet what this is used for.
    if (value & 1 << 0) console.log('AGC WARNING is on');

    // Update COMP ACTY
    if (value & 1 << 1) this.elements.ds1.comp_acty.style.display = 'inherit';
    else this.elements.ds1.comp_acty.style.display = 'none';

    this.switchLamp('00', value & 1 << 2); // UPLINK ACTY
    this.switchLamp('01', value & 1 << 3); // TEMP
    this.switchLamp('30', value & 1 << 4); // KEY REL

    // Blink verb and noun digits (means: user input requested)
    if (value & 1 << 5) {
      this.elements.ds1['41'].classList.add('off');
      this.elements.ds1['42'].classList.add('off');
      this.elements.ds1['51'].classList.add('off');
      this.elements.ds1['52'].classList.add('off');
    } else {
      this.elements.ds1['41'].classList.remove('off');
      this.elements.ds1['42'].classList.remove('off');
      this.elements.ds1['51'].classList.remove('off');
      this.elements.ds1['52'].classList.remove('off');
    }

    this.switchLamp('40', value & 1 << 6); // OPR ERR
    this.switchLamp('31', value & 1 << 7); // RESTART
    this.switchLamp('20', value & 1 << 8); // STBY

    // I don't know yet what this is used for.
    if (value & 1 << 9) console.log('EL OFF is on');
  }

  switchLamp(id, state) {
    const element = this.elements.ds2[`lamp${id}`];
    if (state) element.classList.add('on');
    else element.classList.remove('on');
  }

  handleDigitUpdate(newVal) {
    const selector = newVal >> 11;

    /**
     * The following is a translation of table 4-C at
     * https://archive.org/stream/acelectroniclmma00acel_0#page/n352/mode/1up
     *
     * I found the table not to be fully correct. I corrected it empirically.
     */
    const valueSign = (newVal >> 10) & 0x01;

    let id1;
    let id2;

    switch (selector) {
      case 1:
        id1 = '32';
        id2 = '31';
        this.state.sign3m = valueSign;
        break;
      case 2:
        id1 = '34';
        id2 = '33';
        this.state.sign3p = valueSign;
        break;
      case 3:
        id1 = '21';
        id2 = '35';
        break;
      case 4:
        id1 = '23';
        id2 = '22';
        this.state.sign2m = valueSign;
        break;
      case 5:
        id1 = '25';
        id2 = '24';
        this.state.sign2p = valueSign;
        break;
      case 6:
        id1 = '12';
        id2 = '11';
        this.state.sign1m = valueSign;
        break;
      case 7:
        id1 = '14';
        id2 = '13';
        this.state.sign1p = valueSign;
        break;
      case 8:
        id2 = '15';
        break;
      case 9:
        // noun
        id1 = '51';
        id2 = '52';
        break;
      case 10:
        // verb
        id1 = '41';
        id2 = '42';
        break;
      case 11:
        // prog
        id1 = '71';
        id2 = '72';
        break;
      case 12:
        this.switchLamp('50', newVal & 1 << 0); // PRIO DISP
        this.switchLamp('60', newVal & 1 << 1); // NO DAP
        this.switchLamp('61', newVal & 1 << 2); // VEL
        this.switchLamp('10', newVal & 1 << 3); // NO ATT
        this.switchLamp('51', newVal & 1 << 4); // ALT
        this.switchLamp('11', newVal & 1 << 5); // GIMBAL LOCK
        this.switchLamp('41', newVal & 1 << 7); // TRACKER
        this.switchLamp('21', newVal & 1 << 8); // PROG
        break;
      default:
        break;
    }

    // Render right digit of selected pair
    if (id1) {
      const element = this.elements.ds1[id1];
      const value = (newVal >> 5) & 0b00011111;
      const segments = DskyInterface.valueToSegmentLabels(value);
      element.setAttribute('segments', segments);
    }

    // Render right digit of selected pair
    if (id2) {
      const element = this.elements.ds1[id2]; // right element
      const value = newVal & 0b00011111; // right digit
      const segments = DskyInterface.valueToSegmentLabels(value);
      element.setAttribute('segments', segments);
    }

    // Render + or - sign for each row
    for (const row of [1, 2, 3]) {
      // Quoted from
      // https://www.ibiblio.org/apollo/developer.html#Packets_for_Socket_Implementation_of_AGS
      //
      // > for each sign bit, the most recent 1+ and 1- flags are saved. If both are 0, then the +/-
      // > sign is blank; if 1+ is set and 1- is not, then the '+' sign is displayed; if just the 1-
      // > flag is set, or if both 1+ and 1- flags are set, the '-' sign is displayed.
      let segments;
      if (!this.state[`sign${row}m`] && !this.state[`sign${row}p`]) segments = '';
      else if (this.state[`sign${row}p`] && !this.state[`sign${row}m`]) segments = 'abc';
      else segments = 'b';

      this.elements.ds1[`${row}sign`].setAttribute('segments', segments);
    }
  }

  /*
   * The following implements more combinations than given in table 4-C1 of
   * https://archive.org/stream/acelectroniclmma00acel_0#page/n353/mode/1up
   * thanks to
   * https://www.ibiblio.org/apollo/developer.html
   */
  static valueToSegmentLabels(value) {
    switch (value) {
      case 0: return ''; // blank
      case 1: return 'h';
      case 2: return 'm';
      case 3: return 'hm'; // 1
      case 4: return 'fm';
      case 5: return 'fhm';
      case 6: return 'fm';
      case 7: return 'fhm';

      case 8: return 'j';
      case 9: return 'jh';
      case 10: return 'jm';
      case 11: return 'jhm';
      case 12: return 'fjm';
      case 13: return 'fjhm'; // 4
      case 14: return 'fjm';
      case 15: return 'fjhm'; // 4

      case 16: return 'ek';
      case 17: return 'keh';
      case 18: return 'em';
      case 19: return 'ehm'; // 7
      case 20: return 'efknm';
      case 21: return 'ehmnkf'; // 0
      case 22: return 'efmn';
      case 23: return 'fehmn';

      case 24: return 'ejkn';
      case 25: return 'ehjkn'; // 2
      case 26: return 'ejmn';
      case 27: return 'ehjmn'; // 3
      case 28: return 'efknmj'; // 6
      case 29: return 'ehmnkfj'; // 8
      case 30: return 'efjmn'; // 5
      case 31: return 'efjhmn'; // 9
      default: return null;
    }
  }

  static get observedAttributes() {
    return ['data-input1', 'data-input2', 'data-keypress'];
  }
}

customElements.define('dsky-interface', DskyInterface);
