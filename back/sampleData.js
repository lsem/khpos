const moment = require("moment");
const uuid = require('uuid');

function newJobId() {
  return 'JOB-' + uuid.v4()
}
function newTechMapId() {
  return 'TM-' + uuid.v4()
}
function newTaskId() {
  return 'TASK-' + uuid.v4()
}
function newAssigneId() {
  return 'ASSIGNEE-' + uuid.v4()
}


function getPlan(fromDate, toDate) {
  console.log(fromDate);
  const plan = [
    {
      startTime: moment(fromDate).add(115, "minutes").valueOf(),
      id: newJobId(),
      column: 0,
      techMap: {
        id: newTechMapId(),
        name:"1",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: newTaskId(),
            name: "task 1",
            durationMins: 10,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: newTaskId(),
            name: "task 2",
            durationMins: 20,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: newTaskId(),
            name: "task 3",
            durationMins: 10,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: newTaskId(),
            name: "task 4",
            durationMins: 10,
            bgColor: "rgb(255, 149, 0)"
          },
        ]
      }
    },
    {
      startTime: moment(fromDate).add(4, "hours").valueOf(),
      id: newJobId(),
      column: 0,
      techMap: {
        id: newTechMapId(),
        name:"1",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: newTaskId(),
            name: "task 1",
            durationMins: 20,
            bgColor: "rgb(216, 216, 216)",
            assigned: [
              {
                id: newAssigneId(),
                firstName: "Аня",
                color: "#5AC8FA"
              }
            ]
          },
          {
            id: newTaskId(),
            name: "task 2",
            durationMins: 10,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: newTaskId(),
            name: "task 3",
            durationMins: 20,
            bgColor: "rgb(216, 216, 216)",
            assigned: [
              {
                id: newAssigneId(),
                firstName: "Аня",
                color: "#5AC8FA"
              },
              {
                id: newAssigneId(),
                firstName: "Вітя",
                color: "#4CD964"
              }
            ]
          },
          {
            id: newTaskId(),
            name: "task 4",
            durationMins: 20,
            bgColor: "rgb(255, 149, 0)"
          }
        ]
      }
    },
    {
      startTime: moment(fromDate).add(1, "hours").add(30, "minutes").valueOf(),
      id: newJobId(),
      column: 1,
      techMap: {
        id: newTechMapId(),
        name:"2",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: newTaskId(),
            name: "task 1",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: newTaskId(),
            name: "task 2",
            durationMins: 40,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: newTaskId(),
            name: "task 3",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)",
            assigned: [
              {
                id: newAssigneId(),
                firstName: "Настя",
                color: "#FFCC00"
              }
            ]
          },
          {
            id: newTaskId(),
            name: "task 4",
            durationMins: 20,
            bgColor: "rgb(255, 149, 0)"
          }
        ]
      }
    },
    {
      startTime: moment(fromDate).add(2, "hours").add(30, "minutes").valueOf(),
      id: newJobId(),
      column: 2,
      techMap: {
        id: newTechMapId(),
        name:"3",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: newTaskId(),
            name: "task 1",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)",
            assigned: [
              {
                id: newAssigneId(),
                firstName: "Настя",
                color: "#FFCC00"
              }
            ]
          },
          {
            id: newTaskId(),
            name: "task 2",
            durationMins: 10,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: newTaskId(),
            name: "task 3",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: newTaskId(),
            name: "task 4",
            durationMins: 10,
            bgColor: "rgb(255, 149, 0)"
          },
        ]
      }
    },
    {
      startTime: moment(fromDate).add(3, "hours").add(55, "minutes").valueOf(),
      id: newJobId(),
      column: 7,
      techMap: {
        id: newTechMapId(),
        name:"3",
        tintColor: "rgb(216, 216, 216)",
        tasks: [
          {
            id: newTaskId(),
            name: "task 1",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: newTaskId(),
            name: "task 2",
            durationMins: 10,
            bgColor: "rgb(200, 200, 200)"
          },
          {
            id: newTaskId(),
            name: "task 3",
            durationMins: 30,
            bgColor: "rgb(216, 216, 216)"
          },
          {
            id: newTaskId(),
            name: "task 4",
            durationMins: 10,
            bgColor: "rgb(255, 149, 0)"
          },
        ]
      }
    }
  ]
  return plan
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