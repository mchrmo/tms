'use client'

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ComboboxDemo } from "../ui/combobox";
import {Autocomplete, AutocompleteItem} from "@nextui-org/react";
import {useAsyncList} from "@react-stately/data";
import { Organization, User } from "@prisma/client";
import UserCombobox from "../users/user-combobox";
import OrganizationCombobox from "../organizations/organization-combobox";
import { BaseSyntheticEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import OrganizationMemberCombobox, { OrganizationMemberWithUser } from "./member-combobox";


export type MemberFormData = {
  user_id?: number;
  manager_id?: number;
  organization_id?: number;
  position_name?: string
}

const formSchema = z.object({
  userId: z.number(),
  organizationId: z.number(),
  name: z.string().regex(new RegExp(/^[A-Z][a-z]*\s[A-Z][a-z]*/), "Zadajte meno a priezvisko")
})


export default function AddMemberForm({formData, setFormData}: {formData: MemberFormData, setFormData: Dispatch<SetStateAction<MemberFormData>>}) {


  const onUserSelect = (user: User) => {

    setFormData((data) => ({
      ...data,
      user_id: user.id
    }))
  }

  const onManagerSelect = (member: OrganizationMemberWithUser) => {
    
    setFormData((data) => ({
      ...data,
      manager_id: member.user_id
    }))
  }

  const onOrgSelect = (organization: Organization) => {
    setFormData((data) => ({
      ...data,
      organization_id: organization.id
    }))
  }
  
  const onPositionChange = (e: BaseSyntheticEvent) => {
    
    setFormData((data) => ({
      ...data,
      position_name: e.target.value
    }))
  }


  return (

    <form  className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Užívateľ
        </Label>

        <UserCombobox onSelectResult={onUserSelect} mode="unassigned"></UserCombobox>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Organizácia
        </Label>

        <OrganizationCombobox onSelectResult={onOrgSelect}></OrganizationCombobox>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Nadriadený
        </Label>

        <OrganizationMemberCombobox onSelectResult={onManagerSelect}></OrganizationMemberCombobox>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Pozícia
        </Label>
        <Input
          id="position"
          placeholder="Pozíca"
          className="w-[250px]"
          onChange={onPositionChange}
        />
      </div>
    </form>

  )

}