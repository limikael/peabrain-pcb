export default async function(sch) {
	await sch.use([
		"Connector_Generic:Conn_01x04",
		"Connector_Generic:Conn_02x02_Counter_Clockwise",
		"Connector_Generic:Conn_02x08_Counter_Clockwise",
		"Connector_Generic:Conn_02x04_Counter_Clockwise",
		"Device:R"
	]);

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

	let i2c=sch.declare("J5",{
		symbol: "Connector_Generic:Conn_01x04",
		footprint: "Peabrain:I2C_Connector",
	});

	let rotary=sch.declare("J6",{
		symbol: "Connector_Generic:Conn_01x05",
		footprint: "Peabrain:RotaryEncoderConnection",
	});

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

	let led=sch.declare("D1",{
		symbol: "Device:LED",
		footprint: "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical"
	});

	let d2=sch.declare("D2",{
		symbol: "Device:D",
		footprint: "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal"
	});

	screw1.pin(1).connect("GND");
	screw1.pin(2).connect("12V");
	screw1.pin(3).connect("CANH");
	screw1.pin(4).connect("CANL");

	screw2.pin(1).connect("GND");
	screw2.pin(2).connect("12V");
	screw2.pin(3).connect("CANH");
	screw2.pin(4).connect("CANL");

	tja1050.pin(1).connect("5V");
	//tja1050.pin(2).connect(esp32.pin(1)); // tx
	esp32.pin(1).connect(r5.pin(1));
	tja1050.pin(2).connect(r5.pin(2));

	tja1050.pin(3).connect(esp32.pin(13)); // rx
	tja1050.pin(4).connect("GND");
	tja1050.pin(6).connect("CANL");
	tja1050.pin(7).connect("CANH");

	esp32.pin(14).connect("3V3");
	esp32.pin(15).connect("GND");
	esp32.pin(16).connect("5V");

	vreg.pin(1).connect("12V");
	vreg.pin(2).connect("GND");
	vreg.pin(3).connect("GND");
	//vreg.pin(4).connect("5V");

	d2.pin(1).connect("5V");
	d2.pin(2).connect(vreg.pin(4));


	i2c.pin(1).connect("GND");
	i2c.pin(2).connect("5V");
	i2c.pin(3).connect(esp32.pin(4)); // sda, gpio 8
	i2c.pin(4).connect(esp32.pin(5)); // slc, gpio 9

	rotary.pin(1).connect("GND");
	rotary.pin(2).connect("3V3");
	rotary.pin(3).connect(esp32.pin(6))
	rotary.pin(4).connect(esp32.pin(7));
	rotary.pin(5).connect(esp32.pin(8))

	r1.pin(1).connect("GND");
	r1.pin(2).connect("GND");

	r2.pin(1).connect("5V");
	r2.pin(2).connect("5V");

	r3.pin(1).connect("3V3");
	r3.pin(2).connect("3V3");

	r4.pin(1).connect(esp32.pin(9));
	r4.pin(2).connect(led.pin(1));
	led.pin(2).connect("3V3");
}