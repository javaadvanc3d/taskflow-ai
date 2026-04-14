-- tasks policies
create policy "users can select own tasks"
  on tasks for select
  using ((select auth.uid()) = user_id);

create policy "users can insert own tasks"
  on tasks for insert
  with check ((select auth.uid()) = user_id);

create policy "users can update own tasks"
  on tasks for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own tasks"
  on tasks for delete
  using ((select auth.uid()) = user_id);

-- profiles policies
create policy "profiles are publicly readable"
  on profiles for select
  using (true);

create policy "users can update own profile"
  on profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
