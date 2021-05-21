// SPDX-License-Identifier: GPL-2.0-or-later
// SPDX-FileCopyrightText: Copyright 2020 Michael Karl Franzl <public.michael@franzl.name>

import '../webDSKY.js'

async function run() {
  const pre = document.getElementById('html');
  const dsky = document.getElementById('dsky');
  pre.innerText = dsky.outerHTML;

  const inputDigits = document.getElementById('input1');
  inputDigits.addEventListener('change', (event) => {
    dsky.setAttribute('data-input1', event.target.value);
    pre.innerText = dsky.outerHTML;
  });

  const inputLamps = document.getElementById('input2');
  inputLamps.addEventListener('change', (event) => {
    dsky.setAttribute('data-input2', event.target.value);
    pre.innerText = dsky.outerHTML;
  });

  const remoteControlInput = document.getElementById('remote_control');
  remoteControlInput.addEventListener('keydown', (event) => {
    let key;
    if (event.key === '+') key = 'p';
    else if (event.key === '-') key = 'm';
    else if (event.key === 'Enter') key = 'e';
    else key = event.key.toLowerCase();
    dsky.setAttribute('data-keypress', key);
    pre.innerText = dsky.outerHTML;
  });

  remoteControlInput.addEventListener('keyup', () => {
    dsky.setAttribute('data-keypress', '');
    pre.innerText = dsky.outerHTML;
  });

  const proceedOutput = document.getElementById('proceed');
  const outputValue = document.getElementById('value');
  dsky.addEventListener('proceed', ({ detail }) => {
    proceedOutput.innerHTML = detail;
  });
  dsky.addEventListener('keypress', ({ detail }) => {
    outputValue.innerHTML = detail.toString(2).padStart(5, '0');
  });
}

window.addEventListener('load', run);
