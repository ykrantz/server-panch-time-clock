// ++++++++++++++++++++++++
// content:
// 10: defining main variable and structre
// 20: Main

// 25: getting data from DB
// 26:createing in DB
// 27: finding in DB
// 28:update data in DB
// 30: get responed
// 40: post responed
// 50: put, delete and other responds
// 60: init server
// 70: Suport Function
// 80: Side functions
// 90: Validation Functions
// +++++++++++++++++++++

// **********
// Level 10: defining main variable and structre
// **********
require("dotenv").config();
const PINCH_IN = "enter";
const PINCH_OUT = "exit";

const MONGO_URL = process.env.MONGO_URL;

const DATA_BASE = "emoployeePunchTime";

const { employeeSchema, find } = require("./modules/Employee");
const { shiftSchema } = require("./modules/Shift");
const { enteranceSchema } = require("./modules/Enterance");

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require("cors");
const { json } = require("body-parser");
app.use(cors());

const mongoose = require("mongoose");

const port = 5004;

// **********

// **********
// Level 20: Main
// **********

// **********
// **********
// 25: getting data from DB
// **********
// **********

// **********
// 26:createing in DB
// **********

async function getConnection() {
  try {
    // console.log("$$$$", { MONGO_URL });
    return await mongoose.connect(MONGO_URL);

    // MONGO_URL
    // `${MONGO_URL}`
  } catch (e) {
    console.log(e);
  }
}
// *********
// create employee
// *********
async function create_employee(id, name) {
  const connection = await getConnection();
  console.log("%%%", "conect");
  // const Employee = connection.model("Employee", { id: String, name: String });
  const Employee = connection.model("Employee", employeeSchema);
  const newEmployee = new Employee({ id: id, name: name, shifts: [] });
  newEmployee
    .save()
    .then((upddateEmployee) =>
      console.log("Employee was saved: ", upddateEmployee)
    );
}

async function create_employee_with_shift(id, name) {
  const connection = await getConnection();
  const Employee = connection.model("Employee", employeeSchema);
  const newEmployee = new Employee({
    id: id,
    name: name,
    shifts: [
      "61e0b14a7fdbdedec3e5d16c",
      "61e0b45aa268e27a3638f458",
      "61e0b4c635b428e95bcb3648",
    ],
  });
  newEmployee
    .save()
    .then((upddateEmployee) =>
      console.log("Employee was saved: ", upddateEmployee)
    );
}

// *********
// create action enter/exit shift
// *********

async function reportShift(enterTime, exitTime) {
  const connection = await getConnection();
  const Shift = connection.model("Shift", shiftSchema);
  const shift = await new Shift({ enter: enterTime, exit: exitTime });

  shiftSaved = await shift.save();
  console.log("shift was saved: ", shiftSaved._id);

  return shiftSaved._id;
}

// *********
// create enter shift
// *********
async function reportEnterance(id, time) {
  const connection = await getConnection();
  const Enterance = connection.model("Enterance", enteranceSchema);
  const enterance = new Enterance({ id: id, enter: time });

  enterance
    .save()
    .then((enteranceSaved) =>
      console.log("enterance was saved: ", enteranceSaved)
    );
}

// *********
// *********
// 27: finding in DB
// *********
// *********

// *********
// find employee
// *********
async function findEmployee(id) {
  try {
    const connection = await getConnection();
    const Employee = connection.model("Employee", employeeSchema);
    const employee = await Employee.findOne({ id: id });
    console.log("employee found:", employee);
    return employee;
  } catch (e) {
    console.log(e);
  }
}

// *********
// find enternce
// *********

async function findEnterance(id) {
  try {
    const connection = await getConnection();
    const Enterance = connection.model("Enterance", employeeSchema);
    const enterance = await Enterance.findOne({ id: id });
    console.log("enterance found:", enterance);
    return enterance.enter;
  } catch (e) {
    console.log(e);
  }
}

// *********
// find all shifts. with deatials of shifts
// *********

async function findShiftsOfID(id) {
  try {
    const connection = await getConnection();
    const Employee = connection.model("Employee", employeeSchema);
    const employee = await Employee.findOne({ id: id }).populate("shifts");

    console.log("employee shifts:", employee.shifts);
    return employee.shifts;
  } catch (e) {
    console.log(e);
  }
}
// *********
// find all shifts. only object id of shifts
// *********
async function findObjectIDShifts(id) {
  try {
    const connection = await getConnection();
    const Employee = connection.model("Employee", employeeSchema);
    const employee = await Employee.findOne({ id: id });

    console.log("employee object shifts:", employee.shifts);
    return employee.shifts;
  } catch (e) {
    console.log(e);
  }
}

// *********// *********
// 28:update and delete data in DB
// *******// ***********

// *********
// update new shift
// *********

async function insertNewShift(id, enter, exit) {
  try {
    const currentShifts = await findObjectIDShifts(id);

    const newShift = await reportShift(enter, exit);

    const newShifts = [...currentShifts, newShift];

    const connection = await getConnection();
    const Employee = connection.model("Employee", employeeSchema);
    await Employee.findOneAndUpdate({ id: id }, { shifts: newShifts });

    console.log("employee shifts was update:", newShifts);
  } catch (e) {
    console.log(e);
  }
}

// **********
// delete enterance
// **********

async function deleteEntrance(id) {
  try {
    const connection = await getConnection();
    const Enterance = connection.model("Enterance", enteranceSchema);
    const enterance = await Enterance.deleteOne({ id: id });

    console.log("enterance  was delete:", enterance);
  } catch (e) {
    console.log(e);
  }
}

// **********
// **********
// Level 30: get responed
// **********

// *******
// report enter or exit:
// *******

app.get("/panchtime/:id/:action/:time", async (req, res) => {
  const id = req.params.id;
  const action = req.params.action;
  const time = Number(req.params.time);
  const time_punched_date_type = new Date(time);

  let messege = "";
  if (!(await findEmployee(id))) {
    await create_employee(id);

    messege = `Welocome new worker. id: ${id}.  `;
    console.log("new worker was insert");
  }

  const entranceTime = await findEnterance(id);
  if (action == PINCH_IN) {
    if (entranceTime) {
      messege = "Eror. you already enter ";
    } else {
      await reportEnterance(id, time);
      messege += `Hi ID: ${id}. You entered at ${time_punched_date_type.toLocaleTimeString()}`;
    }
  } else if (action == PINCH_OUT) {
    if (entranceTime) {
      insertNewShift(id, entranceTime, time);

      let shift_duration = Number(getTimeDifrence(entranceTime, time)).toFixed(
        2
      );

      messege += `Hi ID: ${id}. Your shift was ${shift_duration}  hours`;
      // reseting current shift of the worker

      await deleteEntrance(id);
    } else {
      messege = "Eror. you didn't enter ";
    }
  } else {
    messege = "You didn't pick a corect action";
  }
  res.send(JSON.stringify(messege));
});

// *******
// calc total work
// *******

app.get("/calctotalhourshifts/:id", async (req, res) => {
  let messege = "";
  const id = req.params.id;
  const shifts = await findShiftsOfID(id);
  const isIdExists = await findEmployee(id);

  if (isIdExists) {
    if (shifts.length > 0) {
      messege = `ID: ${id}. You worked total this peryod ${Number(
        calc_total_shift_hours(shifts)
      ).toFixed(2)} hours.`;
    } else {
      messege = `ID: ${id}. You still didnt report working hours`;
    }
  } else {
    messege = `Eror. No id: ${id} exists`;
  }
  res.send(JSON.stringify(messege));
});

// *******
// get all whole shift of worker
// *******
app.get("/wholehourshifts/:id", async (req, res) => {
  let messege = "";

  const id = req.params.id;

  const shifts = await findShiftsOfID(id);
  const isIdExists = await findEmployee(id);

  if (isIdExists) {
    if (shifts.length > 0) {
      messege = get_shifts_as_time_strings(shifts);
    } else {
      messege = `Eror. id: ${id},  no full shift to show`;
    }
  } else {
    messege = `Eror. No id: ${id} exists`;
  }
  res.send(JSON.stringify(messege));
});

// **********
// Level 40: post responed
// **********

// **********
// Level 50: put, delete and other responds
// **********

// **********
// Level 60: init server
// **********
app.listen(port, () => console.log(`server Time Clock on air. port ${port}`));

// **********
// Level 80: Side functions
// **********

function get_shifts_as_time_strings(shifts) {
  return shifts.map((shift) => ({
    enter: time_to_time_string(shift.enter),
    exit: time_to_time_string(shift.exit),
  }));
}

function time_to_time_string(time) {
  return new Date(time).toLocaleTimeString();
}

function getTimeDifrence(time1, time2) {
  return Math.abs((new Date(time2) - new Date(time1)) / 36e5);
}

function calc_total_shift_hours(arr_shifts) {
  let total = 0;
  arr_shifts.forEach((shift) => {
    total += getTimeDifrence(shift.enter, shift.exit);
  });

  return total;
}

// **********

// Level 90:Validation Functions
// **********

function check_valid_number(str) {
  str = Number(str);
  flag = true;

  try {
    if (str == null) throw "you pressed cancel";
    if (str == "") throw "empty";
    if (isNaN(str)) throw "not a number";

    // if need to check if integer
    // if (!Number.isInteger(str)) throw "not a integer";
  } catch (err) {
    console.log(err);
    eror_log.push([err, "number eror"]);

    return false;
  }
  return flag;
}

function check_valid_string(str) {
  try {
    if (String(str).trim() == "" || str == null || str == undefined)
      throw "empty";
    if (String(str).search(/\d/) >= 0) throw "contain a number";
    // only letters or space allowed
    if (String(str).search(/^[a-zA-Z ]+$/) < 0)
      throw "contain char that isn't a letter";
    if (String(str).length > 20) throw "string more than 20 char";
  } catch (err) {
    console.log(err);
    eror_log.push([err, "string eror"]);
    return false;
  }
  return true;
}

function check_valid_id(id) {
  try {
    if (id == "" || id == null || id == undefined) throw "empty";
    if (id == null || id == undefined) throw "you press cancel";
    if (isNaN(id)) throw "contains a char";

    // for Persom ID
    // if (String(id).length != 9) throw "doesn't contain 9 digits";

    // for catalog not more than 9 digit:
    if (String(id).length > 9) throw "contain more than 9 digits";
  } catch (err) {
    console.log(err);
    eror_log.push([err, "id eror"]);
    return false;
  }
  return true;
}
