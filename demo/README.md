# webDSKY demo

The keys, the electroluminiscent display, and the indicator lamps are fully operational.

Just as in the real DSKY, there are two inputs and one output. One input of 15 bits mostly
controlled the 7-segment displays ("mostly" because it also controlled some indicator lamps on the
left) and is called `data-input1`. The other input of 15 bits controlled mostly the indicator lamps
and is called `data-input2`. Both inputs are expected in Base Two format using `0` and `1`.

Input fields below the webDSKY are routed to its inputs so that you can interact with it
experimentally; examples are given to make the webDSKY do something simple. These inputs and outputs
would normally be routed as electrical wires to a real AGC, or to a virtual AGC using events of the
underlying web platform.

The web component emits a `CustomEvent` named `keypress` whenever a key is pressed. The event payload
`detail` contains an unsigned integer corresponding to the key code. The `PRO` key is special; it is
inverted and would be routed to a different input channel of the AGC.

Because using a mouse to interact with the buttons can be slow, the Component supports another input
attribute named `data-keypress` which can be used to 'remote-control' it using the keyboard (v =
VERB, n = NOUN, c = CLR, o = PRO, k = KEY REL, e or Enter = ENTR, R = RSET, p = +, m = -). The
`data-keypress` attribute of the Component takes only the single-letter alphanumeric inputs.

A live version of this demo is hosted at [https://michaelfranzl.github.io/webDSKY/demo/](https://michaelfranzl.github.io/webDSKY/demo/).
