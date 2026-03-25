export default async function(sch, {variant}) {
	/*await sch.use([
		"Connector_Generic:Conn_01x04",
		"Connector_Generic:Conn_02x02_Counter_Clockwise",
		"Connector_Generic:Conn_02x08_Counter_Clockwise",
		"Connector_Generic:Conn_02x04_Counter_Clockwise",
		"Device:R"
	]);*/

	let screw1=sch.declare("J1",{
		symbol: "Connector_Generic:Conn_01x04",
		footprint: "Peabrain:ScrewTerminals_4P",
	});

	let screw2=sch.declare("J2",{
		symbol: "Connector_Generic:Conn_01x04",
		footprint: "Peabrain:ScrewTerminals_4P",
	});

	let screw3=sch.declare("J3",{
		symbol: "Connector_Generic:Conn_01x04",
		footprint: "Peabrain:ScrewTerminals_4P",
	});

	let screw4=sch.declare("J4",{
		symbol: "Connector_Generic:Conn_01x04",
		footprint: "Peabrain:ScrewTerminals_4P",
	});

	let vreg=sch.declare("U1",{
		symbol: "Connector_Generic:Conn_02x02_Counter_Clockwise",
		footprint: "Peabrain:VoltageRegulator",
	});

	let esp32=sch.declare("U2",{
		symbol: "Connector_Generic:Conn_02x08_Counter_Clockwise",
		footprint: "Peabrain:ESP32",
	});

	let tja1050=sch.declare("U3",{
		symbol: "Connector_Generic:Conn_02x04_Counter_Clockwise",
		footprint: "Peabrain:TJA1050",
	});

	let i2c, rotary;
	if (variant=="liu") {
		i2c=sch.declare("J5",{
			symbol: "Connector_Generic:Conn_01x04",
			footprint: "Peabrain:I2C_Connector",
		});

		rotary=sch.declare("J6",{
			symbol: "Connector_Generic:Conn_01x05",
			footprint: "Peabrain:RotaryEncoderConnection",
		});
	}

	let drv8825;
	if (variant=="motor") {
		drv8825=sch.declare("U4",{
			symbol: "Connector_Generic:Conn_02x08_Counter_Clockwise",
			footprint: "Peabrain:DRV8825",
		});
	}

	let r1=sch.declare("R1",{
		symbol: "Device:R",
		footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
	});

	let r2=sch.declare("R2",{
		symbol: "Device:R",
		footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
	});

	let r3=sch.declare("R3",{
		symbol: "Device:R",
		footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
	});

	let r4=sch.declare("R4",{
		symbol: "Device:R",
		footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
	});

	let r5=sch.declare("R5",{
		symbol: "Device:R",
		footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
	});

	let r6=sch.declare("R6",{
		symbol: "Device:R",
		footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
	});

	let r7;
	if (variant=="gpio" || variant=="motor") {
		r7=sch.declare("R7",{
			symbol: "Device:R",
			footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
		});
	}

	let led=sch.declare("D1",{
		symbol: "Device:LED",
		//footprint: "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical"
		footprint: "Peabrain:PinHeader_Diode"
	});

	let d2=sch.declare("D2",{
		symbol: "Device:D",
		footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
	});

	// CAN
	esp32.pin(13).connect(r5.pin(1));
	esp32.pin(1).connect(r6.pin(1));

	tja1050.pin(1).connect("5V");
	tja1050.pin(2).connect(r6.pin(2)); // tx
	tja1050.pin(3).connect(r5.pin(2)); // rx
	tja1050.pin(4).connect("GND");
	tja1050.pin(6).connect("CANL");
	tja1050.pin(7).connect("CANH");

	// ESP power
	esp32.pin(14).connect("3V3");
	esp32.pin(15).connect("GND");
	esp32.pin(16).connect("5V");

	// VREG
	vreg.pin(1).connect("12V");
	vreg.pin(2).connect("GND");
	vreg.pin(3).connect("GND");
	d2.pin(1).connect("5V");
	d2.pin(2).connect(vreg.pin(4));

	// 0ohm
	r1.pin(1).connect("GND");
	r1.pin(2).connect("GND");
	r2.pin(1).connect("5V");
	r2.pin(2).connect("5V");
	r3.pin(1).connect("3V3");
	r3.pin(2).connect("3V3");

	// Status LED
	r4.pin(2).connect(led.pin(1));
	r4.pin(1).connect(esp32.pin(4)); // GPIO8 for status LED
	led.pin(2).connect("3V3");

	screw1.pin(1).connect("GND");
	screw1.pin(2).connect("12V");
	screw1.pin(3).connect("CANH");
	screw1.pin(4).connect("CANL");

	if (variant=="liu") {
		screw2.pin(1).connect("GND");
		screw2.pin(2).connect("12V");
		screw2.pin(3).connect("CANH");
		screw2.pin(4).connect("CANL");

		i2c.pin(1).connect("GND");
		i2c.pin(2).connect("5V");
		i2c.pin(3).connect(esp32.pin(9)); // sda, gpio 0
		i2c.pin(4).connect(esp32.pin(10)); // slc, gpio 1

		rotary.pin(1).connect("GND");
		rotary.pin(2).connect("3V3");
		rotary.pin(3).connect(esp32.pin(6))
		rotary.pin(4).connect(esp32.pin(7));
		rotary.pin(5).connect(esp32.pin(8))
	}

	if (variant=="gpio") {
		/*
		IO1  GPIO0  // 9
		IO2  GPIO1  // 10
		IO3  GPIO3  // 12
		IO4  GPIO6  // 2
		IO5  GPIO7  // 3
		IO6  GPIO10 // 6
		IO7  GPIO20 // 7
		IO8  GPIO21 // 8
		*/

		screw2.pin(1).connect("GND");
		screw2.pin(2).connect("3V3");
		screw2.pin(3).connect(esp32.pin(9));
		screw2.pin(4).connect(esp32.pin(10));

		screw3.pin(1).connect("GND");
		screw3.pin(2).connect("3V3");
		screw3.pin(3).connect(r7.pin(2)); esp32.pin(12).connect(r7.pin(1));
		screw3.pin(4).connect(esp32.pin(2));

		screw4.pin(1).connect(esp32.pin(3));
		screw4.pin(2).connect(esp32.pin(6));
		screw4.pin(3).connect(esp32.pin(7));
		screw4.pin(4).connect(esp32.pin(8));
	}

	if (variant=="motor") {
		let c1=sch.declare("C1",{
			symbol: "Device:C_Polarized",
			footprint: "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical"
		});

		c1.pin(1).connect(drv8825.pin(16));
		c1.pin(2).connect("GND");

		drv8825.pin(1).connect(esp32.pin(2)); // enable (gpio6)
		drv8825.pin(2).connect(esp32.pin(9)); // m0 (gpio0)
		drv8825.pin(3).connect(esp32.pin(10)); // m1 (gpio1)
		drv8825.pin(4).connect(esp32.pin(12)); // m2 (gpio3)
		drv8825.pin(5).connect("3V3");
		drv8825.pin(6).connect("3V3");
		drv8825.pin(7).connect(esp32.pin(5)); // step (gpio9)
		drv8825.pin(8).connect(esp32.pin(6)); // dir (gpio10)

		drv8825.pin(9).connect("GND");
		drv8825.pin(10).connect(r7.pin(1)); // fault (gpio21)
		drv8825.pin(11).connect(screw4.pin(4));
		drv8825.pin(12).connect(screw4.pin(3));
		drv8825.pin(13).connect(screw4.pin(2));
		drv8825.pin(14).connect(screw4.pin(1));
		drv8825.pin(15).connect("GND");
		drv8825.pin(16).connect(screw3.pin(2));

		esp32.pin(8).connect(r7.pin(2));

		screw3.pin(1).connect("GND");

		screw2.pin(1).connect("GND");
		screw2.pin(2).connect("3V3");
		screw2.pin(3).connect(esp32.pin(3));
		screw2.pin(4).connect(esp32.pin(7));
	}
}