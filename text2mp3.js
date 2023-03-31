const { exec } = require("child_process");
const fs = require("fs");
const csv = require("csv-parser");

const list = [];

let count = 0;
let loadfile = "data.csv";

let aiff = "./aiff";
let mp3 = "./mp3";

const makeAiff = () => {
  if (!fs.existsSync(aiff)) {
    fs.mkdir(aiff, (err) => {
      if (err) {
        console.log(err.toString());
        return;
      }
      makeMp3();
    });
  } else {
    fs.rmdir(aiff, { recursive: true, force: true }, (err) => {
      if (err) throw err;
      fs.mkdir(aiff, (err) => {
        if (err) {
          console.log(err.toString());
          return;
        }
        makeMp3();
      });
    });
  }
};

const makeMp3 = () => {
  if (!fs.existsSync(mp3)) {
    fs.mkdir(mp3, (err) => {
      if (err) {
        console.log(err.toString());
        return;
      }
      loadCsv();
    });
  } else {
    fs.rmdir(mp3, { recursive: true, force: true }, (err) => {
      if (err) throw err;
      fs.mkdir(mp3, (err) => {
        if (err) {
          console.log(err.toString());
          return;
        }
        loadCsv();
      });
    });
  }
};

const loadCsv = () => {
  fs.createReadStream(loadfile)
    .pipe(csv())
    .on("data", function (data) {
      list.push(data);
    })
    .on("end", function () {
      textConvert();
    });
};

const textConvert = () => {
  let item = list[count];

  let s = `say ${item.text} -v kyoko -o ./aiff/${item.name}`;
  let o = `ffmpeg -i ./aiff/${item.name}.aiff ./mp3/${item.name}.mp3`;

  if (fs.existsSync(`./mp3/${item.name}.mp3`)) {
    console.log(`pass: ${item.name}.mp3`);
    next();
  } else {
    exec(s, (err, stdout, stderr) => {
      if (err) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      exec(o, (err, stdout, stderr) => {
        if (err) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`text:${item.text} => mp3: ${item.name}.mp3`);
        next();
      });
    });
  }
};

const next = () => {
  count++;
  if (count < list.length) {
    setTimeout(() => {
      textConvert();
    }, 10);
  } else {
    fs.rmdir(aiff, { recursive: true }, (err) => {
      if (err) throw err;
      console.log("COMLETE!");
    });
  }
};

makeAiff();
