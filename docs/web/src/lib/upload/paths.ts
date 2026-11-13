// Where uploaded pages live in the private "uploads" bucket. The first folder
// must be the adult's user id: the storage rules only allow that folder.
export const UPLOADS_BUCKET = "uploads";

export const assignmentFolder = (userId: string, assignmentId: string) => `${userId}/assignments/${assignmentId}`;
export const assignmentPagePath = (userId: string, assignmentId: string, page: number) =>
  `${assignmentFolder(userId, assignmentId)}/page-${page}.jpg`;

export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
