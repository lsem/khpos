const EventEmitter = require("events");
let debug = require("debug")("khinmemstorage");
const sampleData = require("./sampleData");
let appErrors = require("./AppErrors");
const _ = require("lodash");

const calcJobDurationInMinutes = job => {
  return _.reduce(job.techMap.tasks, (task, sum) => sum + task.durationMins);
};

class InMemStorage extends EventEmitter {
  constructor() {
    super();
    this.jobs = [];
  }

  start() {
    this.emit("connected");
  }

  async insertJob(jobModel) {
    debug('insertJob: %o', jobModel);
    this.jobs.push(jobModel);
  }

  async getJobs(dateFrom, dateTo) {
    debug('getJobs(all)');
    // @taras: it looks like we need end time for efficient filtering.
    // the same problem will arise will real mongodb.
    return _.filter(
      this.jobs,
      job => true
        // job.startTime > dateFrom &&
        // dateTo <= job.startTime + calcJobDurationInMinutes(job) * 60 * 1000
    );
  }

  async getJobById(id) {
    return _.filter(this.jobs, job => job.id === id);
  }

  async updateJobById(id, model) {
    const index = _.findIndex(this.jobs, job => job.id === id);
    if (index === -1) {
      throw new appErrors.NotFoundError(id);
    }
    this.jobs.splice(index, 1, model);
  }

  async getTechMaps() {
    return await sampleData.getTechMaps();
  }

  async getStaff() {
    return await sampleData.getStaff();
  }
}

module.exports = InMemStorage;