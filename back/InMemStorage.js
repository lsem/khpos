let debug = require("debug")("khinmemstorage");
const sampleData = require("./sampleData");
let appErrors = require("./AppErrors");
const _ = require("lodash");

const calcJobDurationInMinutes = job => {
  return _.reduce(job.techMap.tasks, (task, sum) => sum + task.durationMins);
};

class InMemStorage {
  constructor() {
    this.jobs = [];
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
    return _.filter(_this.jobs, job => job.id === id);
  }

  async getTechMaps() {
    return await sampleData.getTechMaps();
  }

  async getStaff() {
    return await sampleData.getStaff();
  }
}

module.exports = InMemStorage;