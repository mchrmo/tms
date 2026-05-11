'use client'

import { useUser, useUpdateUser } from "@/lib/hooks/user.hooks"
import ViewHeadline from "../common/view-haedline"
import LoadingSpinner from "../ui/loading-spinner"
import Link from "next/link"
import { USER_ROLES_MAP } from "@/lib/models/user.model"
import ChangeUserPasswordModal from "./change-password.modal"
import AttendantGroupManager from "@/components/meetings/attendants/group-manager"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import UnavailabilityForm from "@/components/users/unavailability-form"
import { Building2, KeyRound, Mail, Phone, ShieldCheck, User } from "lucide-react"

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-5 py-3 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

export default function ProfileDetail({ userId, canEdit }: { userId: number; canEdit?: boolean }) {
  const userQ = useUser(userId)
  const user = userQ.data
  const updateUserQ = useUpdateUser(userId)
  const [pendingField, setPendingField] = useState<string | null>(null)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="max-w-2xl space-y-6">
      <ViewHeadline>Profil</ViewHeadline>

      {userQ.error instanceof Error && (
        <div className="text-sm text-red-500">{userQ.error.message}</div>
      )}
      {userQ.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoadingSpinner size="sm" /> Profil sa načitáva…
        </div>
      )}

      {user && (
        <>
          {/* Avatar + name header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold select-none">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight">{user.name}</p>
              <p className="text-sm text-muted-foreground">{USER_ROLES_MAP[user.role.name]}</p>
            </div>
          </div>

          {/* Personal info */}
          <SectionCard title="Osobné údaje">
            <InfoRow icon={<User size={15} />} label="Meno">
              {user.name}
            </InfoRow>
            <InfoRow icon={<Mail size={15} />} label="E-mail">
              {user.email}
            </InfoRow>
            <InfoRow icon={<Phone size={15} />} label="Telefón">
              {user.phone}
            </InfoRow>
            <InfoRow icon={<ShieldCheck size={15} />} label="Rola">
              {USER_ROLES_MAP[user.role.name]}
            </InfoRow>
            {user.OrganizationMember[0] && (
              <InfoRow icon={<Building2 size={15} />} label="Organizácia">
                <Link className="link" href={'/organizations/members/' + user.OrganizationMember[0].id}>
                  {user.OrganizationMember[0].organization.name}
                </Link>
              </InfoRow>
            )}
            {canEdit && (
              <InfoRow icon={<KeyRound size={15} />} label="Heslo">
                <ChangeUserPasswordModal userId={userId} />
              </InfoRow>
            )}
          </SectionCard>

          {/* Unavailability */}
          {canEdit && (
            <SectionCard title="Dočasná nedostupnosť">
              <p className="text-sm text-muted-foreground mb-4">
                Nastavte obdobie, počas ktorého budete nedostupný. Ostatní uvidia upozornenie pri výbere vás ako zodpovednej osoby alebo pri pozvaní na poradu.
              </p>
              <UnavailabilityForm
                userId={userId}
                unavailable_from={user.unavailable_from}
                unavailable_to={user.unavailable_to}
              />
            </SectionCard>
          )}

          {/* Notifications */}
          {canEdit && (
            <SectionCard title="Notifikácie">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="morning_report"
                    checked={!!user.morning_report}
                    disabled={pendingField === 'morning_report'}
                    onCheckedChange={(checked) => {
                      setPendingField('morning_report')
                      updateUserQ.mutate(
                        { id: userId, morning_report: !!checked },
                        { onSettled: () => setPendingField(null) }
                      )
                    }}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="morning_report" className={`font-medium ${pendingField === 'morning_report' ? 'opacity-50' : ''}`}>
                      Ranný report
                      {pendingField === 'morning_report' && <LoadingSpinner size="sm" className="ml-2" />}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Dostávať súhrn úloh každé ráno</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="afternoon_report"
                    checked={!!user.afternoon_report}
                    disabled={pendingField === 'afternoon_report'}
                    onCheckedChange={(checked) => {
                      setPendingField('afternoon_report')
                      updateUserQ.mutate(
                        { id: userId, afternoon_report: !!checked },
                        { onSettled: () => setPendingField(null) }
                      )
                    }}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="afternoon_report" className={`font-medium ${pendingField === 'afternoon_report' ? 'opacity-50' : ''}`}>
                      Poobedný report
                      {pendingField === 'afternoon_report' && <LoadingSpinner size="sm" className="ml-2" />}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Dostávať súhrn úloh každé poobede</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Attendant groups */}
          {canEdit && (
            <SectionCard title="Moje skupiny účastníkov">
              <AttendantGroupManager />
            </SectionCard>
          )}
        </>
      )}
    </div>
  )
}

