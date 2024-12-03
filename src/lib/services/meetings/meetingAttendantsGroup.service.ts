
interface CreateAttendantGroupReqs {
  user_id: number;
  creator_id: number;
  name: string;
}

const create_attendantGroup = async (groupData: CreateAttendantGroupReqs) => {

  

}


const meetingAttendantsGroupService = {
  create_attendantGroup,
}

export default meetingAttendantsGroupService