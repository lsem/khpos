const moment = require("moment");

function getPlan(fromDate, toDate) {
  console.log(fromDate);
  return [
    {
      startTime: moment(fromDate).add(30, "minutes").valueOf(),
      id: "1",
      column: 0,
      techMap: {
        id:"1",
        name:"1",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: "1",
            name: "task 1",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: "2",
            name: "task 2",
            durationMins: 40,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: "3",
            name: "task 3",
            durationMins: 60,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: "4",
            name: "task 4",
            durationMins: 20,
            bgColor: "rgb(255, 149, 0)"
          },
        ]
      }
    },
    {
      startTime: moment(fromDate).add(1, "hours").add(30, "minutes").valueOf(),
      id: "2",
      column: 1,
      techMap: {
        id:"2",
        name:"2",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: "1",
            name: "task 1",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: "2",
            name: "task 2",
            durationMins: 40,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: "3",
            name: "task 3",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: "4",
            name: "task 4",
            durationMins: 20,
            bgColor: "rgb(255, 149, 0)"
          },
        ]
      }
    },
    {
      startTime: moment(fromDate).add(2, "hours").add(30, "minutes").valueOf(),
      id: "3",
      column: 2,
      techMap: {
        id:"3",
        name:"3",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: "1",
            name: "task 1",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: "2",
            name: "task 2",
            durationMins: 10,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: "3",
            name: "task 3",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: "4",
            name: "task 4",
            durationMins: 10,
            bgColor: "rgb(255, 149, 0)"
          },
        ]
      }
    },
    {
      startTime: moment(fromDate).add(3, "hours").add(55, "minutes").valueOf(),
      id: "4",
      column: 7,
      techMap: {
        id:"3",
        name:"3",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: "1",
            name: "task 1",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: "2",
            name: "task 2",
            durationMins: 10,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: "3",
            name: "task 3",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: "4",
            name: "task 4",
            durationMins: 10,
            bgColor: "rgb(255, 149, 0)"
          },
        ]
      }
    }
  ]
}

module.exports = { getPlan }