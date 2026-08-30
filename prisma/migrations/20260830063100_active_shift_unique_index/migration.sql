-- Enforce at most one active shift (clockOutAt IS NULL) per user.
-- Prisma's schema language can't express a partial unique index, so this is
-- added by hand rather than generated from schema.prisma.
CREATE UNIQUE INDEX "Shift_userId_active_unique" ON "Shift"("userId") WHERE "clockOutAt" IS NULL;
