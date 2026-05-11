import { useToast } from "@/components/ui/use-toast";
import { AttendantGroupWithMembers } from "@/lib/services/meetings/meetingAttendantsGroup.service";
import { getApiClient } from "@/lib/utils/api.utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { meetingQueryKeys } from "./meeting.hooks";

const groupsApi = getApiClient('/meetings/attendants/groups')

export const attendantGroupQueryKeys = {
  all: ['attendantGroups'],
  detail: (id: number) => [...attendantGroupQueryKeys.all, id],
}

export const useAttendantGroups = () => {
  const { toast } = useToast()

  const query = useQuery<AttendantGroupWithMembers[]>({
    queryKey: attendantGroupQueryKeys.all,
    queryFn: async () => {
      const res = await groupsApi.get('')
      return res.data
    },
  })

  return query
}

export const useCreateAttendantGroup = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await groupsApi.post('', { name })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Skupina vytvorená!' })
      queryClient.invalidateQueries({ queryKey: attendantGroupQueryKeys.all })
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message ?? err.message
      toast({ title: 'Chyba', description: msg })
    },
  })
}

export const useUpdateAttendantGroup = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await groupsApi.patch(`/${id}`, { id, name })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Skupina premenovaná!' })
      queryClient.invalidateQueries({ queryKey: attendantGroupQueryKeys.all })
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message ?? err.message
      toast({ title: 'Chyba', description: msg })
    },
  })
}

export const useDeleteAttendantGroup = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await groupsApi.delete(`/${id}`)
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Skupina vymazaná!' })
      queryClient.invalidateQueries({ queryKey: attendantGroupQueryKeys.all })
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message ?? err.message
      toast({ title: 'Chyba', description: msg })
    },
  })
}

export const useAddGroupMember = (groupId: number) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (user_id: number) => {
      const res = await groupsApi.post(`/${groupId}/members`, { user_id })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Člen pridaný!' })
      queryClient.invalidateQueries({ queryKey: attendantGroupQueryKeys.all })
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message ?? err.message
      toast({ title: 'Chyba', description: msg })
    },
  })
}

export const useRemoveGroupMember = (groupId: number) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await groupsApi.delete(`/${groupId}/members/${userId}`)
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Člen odstránený!' })
      queryClient.invalidateQueries({ queryKey: attendantGroupQueryKeys.all })
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message ?? err.message
      toast({ title: 'Chyba', description: msg })
    },
  })
}

export const useApplyGroupToMeeting = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ groupId, meeting_id }: { groupId: number; meeting_id: number }) => {
      const res = await groupsApi.post(`/${groupId}/apply`, { meeting_id })
      return res.data
    },
    onSuccess: (data) => {
      toast({ title: `Skupina pridaná! (${data.added} účastníkov)` })
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.all })
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err.response?.data?.message ?? err.message
      toast({ title: 'Chyba', description: msg })
    },
  })
}
