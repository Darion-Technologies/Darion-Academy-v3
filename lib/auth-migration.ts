export type ProfileIdentity = {
  id: string;
  email: string;
  active: boolean;
};

export type AuthIdentity = {
  id: string;
  email?: string | null;
};

export function identityPlan(profiles: ProfileIdentity[], authUsers: AuthIdentity[]) {
  const byEmail = new Map(authUsers.map((user) => [user.email?.toLowerCase(), user]));
  return profiles.map((profile) => {
    const authUser = byEmail.get(profile.email.toLowerCase());
    return {
      profileId: profile.id,
      email: profile.email,
      active: profile.active,
      authId: authUser?.id ?? null,
      action: authUser
        ? authUser.id === profile.id ? "linked" : "rekey-to-existing-auth"
        : "invite-and-rekey",
    } as const;
  });
}
