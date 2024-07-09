"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import { Textarea } from "../ui/textarea";
import OrganizationMemberCombobox from "../members/member-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { FormField, FormItem } from "../ui/form";
import { useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";
import { useToast } from "../ui/use-toast";

type FormInputs = {
  id?: number ;
  name: string;
  description: string;
  deadline: Date;
  assignee_id: Number | null,
  priority: TaskPriority,
  status: TaskStatus
}

export default function TaskForm({onUpdate, defaultValues: _def}: {onUpdate?: () => void,defaultValues?: any}) {

  const edit = _def ? true : false

  const defaultValues: FormInputs = {...{
    id: undefined,
    name: '',
    description: '',
    deadline: new Date(),
    assignee_id: null,
    priority: 'LOW',
    status: "TODO"
  }, ...(_def ? _def : {})}

  const {register, handleSubmit, watch, reset, setValue, control} = useForm<FormInputs>({defaultValues})
  const router = useRouter()
  const {toast} = useToast()


  const onSubmit: SubmitHandler<FormInputs> = async (data) => {

    fetch('/api/tasks', {
      method: edit ? "PATCH" : "POST",
      body: JSON.stringify(data)
    }).then(res => {
      toast({
        title: "Správa",
        description: "Úloha bola " + (edit ? "upravená" : "vytvorená"),
      })  

      router.refresh() 
      router.back() 
      return res
    }).catch(err => {
      
      toast({
        title: "Chyba",
        description: "Úlohu sa nepodarilo " + (edit ? "upraviť" : "vytvoriť"),
      })  
  
    })
    
}

  const onCancel = () => {
    router.back() 

  }
  
  const onDateSelect = (fieldName: keyof FormInputs, date?: Date) => {
    setValue(fieldName, date ? date : '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="my-8 flex flex-col lg:grid grid-cols-12  gap-4 ">

      <div className="col-span-8 ">
        <Label htmlFor="task-name" >
          Názov úlohy
        </Label>
        <Input
          id="task-name"
          placeholder="Názov úlohy"
          {...register('name')}
        />
      </div>

      <div className="col-span-4">
        <Label >
          Termín dokončenia
        </Label>
        <DatePicker date={watch('deadline')} setDate={(date) => onDateSelect('deadline', date)}></DatePicker>
      </div>

      <div className="col-span-4">
        <Label>Priorita:</Label>
        <FormField control={control} name="priority" render={({field}) => (
          <FormItem>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Nízka</SelectItem>
                <SelectItem value="MEDIUM">Stredná</SelectItem>
                <SelectItem value="HIGH">Vysoká</SelectItem>
                <SelectItem value="CRITICAL">Kritická</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>)}>
        </FormField> 
      </div>

      <div className="col-span-4">
        <Label>Vytvoriť úlohu pre:</Label>
        <OrganizationMemberCombobox defaultValue={_def ? _def.assignee : null} onSelectResult={(member) => setValue('assignee_id' ,member.id)} label="Vybrať osobu"></OrganizationMemberCombobox>
      </div>

      <div className="col-span-4">
        <Label>Status:</Label>
        <FormField control={control} name="status" render={({field}) => (
          <FormItem>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">Zadaná</SelectItem>
                <SelectItem value="WAITING">Čaká</SelectItem>
                <SelectItem value="INPROGRESS">V procese</SelectItem>
                <SelectItem value="CHECKREQ">Kontrola</SelectItem>
                <SelectItem value="DONE">Hotová</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>)}>
        </FormField> 
      </div>


      <div className="col-span-full ">
        <Label htmlFor="task-description" >
          Popis
        </Label>
        <Textarea 
          id="task-description"
          placeholder="Popis zadania úlohy..."
          {...register('description')}
        />
      </div>

      

      <div className="space-x-3 col-span-full">
        <Button variant="secondary" type="button" onClick={() => {onCancel();}}>Zrušiť</Button>
        <Button type="submit" >Uložiť</Button>

      </div>



    </form>
  )

}