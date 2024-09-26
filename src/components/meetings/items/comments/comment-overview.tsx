import { useDeleteMeetingItemComment } from "@/lib/hooks/meeting/meetingItemComment.hooks";
import { MeetingItemCommentDetail } from "@/lib/services/meetings/meetingItemComment.service";
import { formatDateTime } from "@/lib/utils/dates";



export default function MeetingItemCommentsOverview({comments}: {comments: MeetingItemCommentDetail[]}) {


  const deleteCommentQ = useDeleteMeetingItemComment()

  const deleteComment = (id: number) => {
    deleteCommentQ.mutate(id)
  } 

  return (
    <div className="">
      <h3 className="text-xl mb-4">Diskusia:</h3>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {comments.filter(c => c !== null).map((comment, i) => (

            
            <li key={i} className="flex items-start p-4 hover:bg-gray-50">
              <div className="mr-4">
                {/* Placeholder Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-gray-900">{comment && comment.creator.name}</h3>
                      {
                        comment &&(
                          <div className="flex space-x-2">

                        <span className="text-sm text-red-600 hover:text-red-800 cursor-pointer" onClick={() => deleteComment(comment ? comment.id : 0)}>Odstrániť</span>
                        <span className="text-sm text-gray-500">{formatDateTime(comment.createdAt)}</span>
                        </div>)
    
                      }
                </div>
                <p className="mt-2 text-gray-700">{comment && comment.message}</p>
              </div>
            </li>
          ))}
          {!comments.length && <p className="mt-2 text-gray-700">Žiadne komentáre</p>}
        </ul>
      </div>
    </div>
  );

}