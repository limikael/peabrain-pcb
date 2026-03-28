import {declareResistor, declarePinHeader, declareEsp32,
		declareTja1050, declareScrewTerminal, declareDrv8825,
		declareMp1584, declareCapacitor} from "../js/component-declarations.js";

/*
todo!

x capacitor
- limit sw w/ pullup
- status led
- diode (power oring)
*/

export default async function(sch, {variant}) {
	let screw1=declareScrewTerminal(sch,"J1");
	let screw2=declareScrewTerminal(sch,"J2");
	let screw3=declareScrewTerminal(sch,"J3");
	let screw4=declareScrewTerminal(sch,"J4");
	let esp32=declareEsp32(sch,"U1","U2");
	let tja1050=declareTja1050(sch,"U3","U4");
	let mp1584=declareMp1584(sch,"U5","U6","U7","U8");
	let drv8825=declareDrv8825(sch,"U9","U10");
	let r1=declareResistor(sch,"R1",4700);
	let c1=declareCapacitor(sch,"C1","47u");

	screw1.connect("GND","12V","CANH","CANL");
	screw2.connect("GND","VMOT","","");

	esp32._5v.connect("5V");
	esp32._3v3.connect("3V3");
	esp32.gnd.connect("GND");

	tja1050.vcc.connect("5V");
	tja1050.tx.connect(esp32.gpio5);
	r1.connect(tja1050.rx,esp32.gpio4);
	tja1050.gnd.connect("GND");
	tja1050.canl.connect("CANL");
	tja1050.canh.connect("CANH");

	drv8825.en.connect(esp32.gpio6);
	drv8825.m0.connect(esp32.gpio0);
	drv8825.m1.connect(esp32.gpio1);
	drv8825.m2.connect(esp32.gpio3);
	drv8825.rst.connect("3V3");
	drv8825.slp.connect("3V3");
	drv8825.step.connect(esp32.gpio9);
	drv8825.dir.connect(esp32.gpio10);

	drv8825.gnd1.connect("GND");
	drv8825.fault.connect(esp32.gpio21);
	drv8825.a2.connect(screw4.pin(1));
	drv8825.a1.connect(screw4.pin(2));
	drv8825.b1.connect(screw4.pin(3));
	drv8825.b2.connect(screw4.pin(4));
	drv8825.gnd2.connect("GND");
	drv8825.vmot.connect("VMOT");

	c1.connect("VMOT","GND");

	mp1584.vin.connect("12V");
	mp1584.gndin.connect("GND");
	mp1584.gndout.connect("GND");
	mp1584.vout.connect("5V");
}