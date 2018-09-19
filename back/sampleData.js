const moment = require("moment");

function getPlan(fromDate, toDate) {
  console.log(fromDate);
  return [
    {
      startTime: moment(fromDate).add(15, "minutes").valueOf(),
      id: "job-1",
      column: 0,
      techMap: {
        id:"techmap-1",
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
      startTime: moment(fromDate).add(3, "hours").valueOf(),
      id: "job-2",
      column: 0,
      techMap: {
        id:"techmap-1",
        name:"1",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: "1",
            name: "task 1",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)",
            assigned: [
              {
                id: "1",
                firstName: "Аня",
                color: "#5AC8FA"
              }
            ]
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
            bgColor: "rgb(216, 216, 216)",
            assigned: [
              {
                id: "1",
                firstName: "Аня",
                color: "#5AC8FA"
              },
              {
                id: "2",
                firstName: "Вітя",
                color: "#4CD964"
              }
            ]
          },
          {
            id: "4",
            name: "task 4",
            durationMins: 20,
            bgColor: "rgb(255, 149, 0)"
          }
        ]
      }
    },
    {
      startTime: moment(fromDate).add(1, "hours").add(30, "minutes").valueOf(),
      id: "job-3",
      column: 1,
      techMap: {
        id:"techmap-2",
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
          }
        ]
      }
    },
    {
      startTime: moment(fromDate).add(2, "hours").add(30, "minutes").valueOf(),
      id: "job-4",
      column: 2,
      techMap: {
        id:"techmap-3",
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
      id: "job-5",
      column: 7,
      techMap: {
        id:"techmap-3",
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

function getTechMaps() {
  return [
    {
      id: "techmap-1",
      name: "Хліб",
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
        }
      ]
    },
    {
      id: "techmap-2",
      name: "Круасан",
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
        }
      ]
    },
    {
      id: "techmap-3",
      name: "Багет",
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
        }
      ]
    },
    {
      id: "techmap-4",
      name: "Деніш",
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
        }
      ]
    },
    {
      id: "techmap-5",
      name: "Хліб Бородінський",
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
        }
      ]
    }
  ]
}

function getStaff() {
  return [
    {
      id: "1",
      firstName: "Аня",
      color: "#5AC8FA"
    },
    {
      id: "2",
      firstName: "Вітя",
      color: "#4CD964"
    },
    {
      id: "3",
      firstName: "Настя",
      color: "#FFCC00"
    }
  ]
}

module.exports = { getPlan, getTechMaps, getStaff }