'use client'

import { Input } from "../input";
import { Label } from "../label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ComboboxDemo } from "../combobox";
import {Autocomplete, AutocompleteItem} from "@nextui-org/react";
import {useAsyncList} from "@react-stately/data";
import { User } from "@prisma/client";
import UserCombobox from "../users/user-combobox";


const formSchema = z.object({
  userId: z.number(),
  organizationId: z.number(),
  name: z.string().regex(new RegExp(/^[A-Z][a-z]*\s[A-Z][a-z]*/), "Zadajte meno a priezvisko")
})


export default function AddMemberForm({ }) {

  const initialState = { message: null, errors: {}};
  // const [state, dispatch] = useFormState<State<RegistrationFields>, FormData>(create_user, initialState);

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange"
  })

  let list = useAsyncList<User>({
    async load({signal, filterText}) {
      let res = await fetch(`/api/users/unassigned/?search=${filterText}`, {signal});
      let json = await res.json();
      
      return {
        items: json        
      };
    },
  });

  return (

    <form  className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Užívateľ
        </Label>

        <UserCombobox></UserCombobox>
        {/* <Input
          id="name"
          defaultValue="Pedro Duarte"
          className="col-span-3"
        /> */}
      </div>
      {/* <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input
          id="username"
          defaultValue="@peduarte"
          className="col-span-3"
        />
      </div> */}
    </form>

  )

}