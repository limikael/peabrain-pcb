#!/usr/bin/env node

import fs, {promises as fsp} from "fs";
import os from "os";
import {program} from "commander";
import path from "node:path";
import {runCommand} from "./node-util.js";
import {gcodeFindMin, gcodeTranslate, gcodeGrblify} from "./gcode-util.js";

program
    .description("Grbl friendly wrapper for pcb2gcode.")
    .requiredOption("--mill-output <path>","Gcode for milling.")
    .requiredOption("--drill-output <path>","Gcode for drilling.")
//    .argument("<gerber>","Input gerber file.")
    .argument("<pcb>","Pcb file.")

await program.parseAsync();
let options={
    ...program.opts(),
    pcbFile: program.args[0]
}

const tempDirPath=".pcb2grbl";
await fsp.rm(tempDirPath,{force: true, recursive: true});
await fsp.mkdir(tempDirPath,{recursive: true});

await runCommand("flatpak",[
    "run","--command=kicad-cli","org.kicad.KiCad",
    "pcb","export","gerbers",
    options.pcbFile,
    "--layers","B.Cu,Edge.Cuts",
    "--output",tempDirPath,
    "--no-x2"
]);

await runCommand("flatpak",[
    "run","--command=kicad-cli","org.kicad.KiCad",
    "pcb","export","drill",
    options.pcbFile,
    "--output",tempDirPath,
]);

const boardName = path.basename(options.pcbFile, ".kicad_pcb");

//console.log(path.join(tempDirPath,boardName+"-B_Cu.gbl"));
//process.exit();

//flatpak run --command=kicad-cli org.kicad.KiCad pcb export gerbers pcbtest.kicad_pcb --layers B.Cu --output tmp --no-x2

let depths=["-0.1","-0.2","-0.3"];
let millContent="";

for (let depth of depths) {
    await runCommand("pcb2gcode",[
      "--noconfigfile",
      "--back",path.join(tempDirPath,boardName+"-B_Cu.gbl"),
      "--output-dir",tempDirPath,
      "--mill-diameters","1",
      "--mill-feed","100",
      "--mill-speed","10000",
      "--zwork",depth,
      "--zsafe","1.0",
      "--zchange","5.0",
      "--eulerian-paths","0",
      "--tsp-2opt","0",
      "--path-finding-limit","1",
      "--voronoi","0",
      "--isolation-width","0",
      "--nom6","1",
      "--metric",
      "--metricoutput","1",
    ]);

    console.log("Converting file to grbl, depth: "+depth);
    let gcode=fs.readFileSync(path.join(tempDirPath,"back.ngc"), "utf-8")
    millContent+=gcodeGrblify(gcode);
}

for (let depth of depths) {
    await runCommand("pcb2gcode",[
      "--noconfigfile",
      "--back",path.join(tempDirPath,boardName+"-Edge_Cuts.gm1"),
      "--draw-gerber-lines","1",
      "--mill-diameters","0",
      "--output-dir",tempDirPath,
      "--mill-feed","100",
      "--mill-speed","10000",
      "--zwork",depth,
      "--zsafe","1.0",
      "--zchange","5.0",
      "--nom6","1",
      "--metric",
      "--metricoutput","1",
    ]);

    console.log("Converting file to grbl, depth: "+depth);
    let gcode=fs.readFileSync(path.join(tempDirPath,"back.ngc"), "utf-8")
    millContent+=gcodeGrblify(gcode);
}

let [x,y]=gcodeFindMin(millContent);
console.log("Min coord: "+x+","+y);

millContent=gcodeTranslate(millContent,[-x,-y]);
console.log("Writing multi pass to: "+options.millOutput);
await fsp.writeFile(options.millOutput,millContent);

await runCommand("pcb2gcode",[
    "--noconfigfile",
    "--drill",path.join(tempDirPath,boardName+".drl"),
    "--drill-feed","20",
    "--drill-speed","10000",
    "--zdrill","-2.0", // 2.0 to make sure, PCB thickness is actually 1.6
    "--output-dir",tempDirPath,
    "--zsafe","1.0",
    "--zchange","5.0",
    "--drill-side","back",
    "--metric",
    "--metricoutput","1",
]);

let drillContent=await fsp.readFile(path.join(tempDirPath,"drill.ngc"), "utf-8");
drillContent=gcodeGrblify(drillContent);
drillContent=gcodeTranslate(drillContent,[-x,-y]);
await fsp.writeFile(options.drillOutput,drillContent);
