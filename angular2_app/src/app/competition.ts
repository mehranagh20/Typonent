import {CompetitionRemainingTime} from './competition-remaining-time'

export class Competition {

  constructor(
    public id: number,
  public name: string,
  public start_time: string,
  public duration: number,
  public user_registered_number: number,
  public max_competitors: number,
  public remaining_time: CompetitionRemainingTime,
  public has_expired: boolean,
  public time_representation: string,

) {}

}
