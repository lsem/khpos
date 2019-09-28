
//  * POSTER -> KH SYNCHRONIZATION *
//
//	Some data can be just fetched from time to time from Poster,
//  whole data each time which is not effective but possible for small datasets (like recipes).
// To overcome this inefficiency we would need to ask Poster to introduce new API which
// is unlikely to be feasible.
// So to get relatively smalls datasets (even middle-size) we can implement periodic
// "suck-in/fetch". If dataset is bigger, it should already have paging since
// (otherwise their own applications would not work) which can be utilized to fetch data
// page-by-page during some period of time until everything is synced. Once everything is synced,
// we can "commit" this new data into our storage. Apart of this, when needed we can detect
// what have been changed, inserted, removed and properly react on this.
// 
// We can (and probably should) design our own model for Poster-stored data,
// which would allow us to migrate to our own system someday.

// Notes:
// One of non-functional design decision is whether it should be implemented
// inside main application node process or in separate, controller by main application.
//
// - Synchronization should be configurable.
// - As side effect, important poster data will be automatically backed-up in our database.
// - Unit and integration tests are not necessary yet but desirable, so implementation
// 	must be designed to be testable.


class PosterSyncService {
	constructor(PosterAPI posterApi) {
		this.posterApi = posterApi;
	}
}



