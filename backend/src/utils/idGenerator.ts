import User from '../models/user';

export const generateUniqueId = async (
  baseString: string,
  padding: number = 3,
  field: 'enrollmentNumber' | 'rollNumber' = 'enrollmentNumber'
): Promise<string> => {
  const regex = new RegExp(`^${baseString}`);

  const latestUser = await User.findOne({ [field]: regex })
    .sort({ [field]: -1 })
    .exec();

  let sequence = 1;
  if (latestUser) {
    const latestId = (latestUser as any)[field] as string;
    if (latestId) {
      const parts = latestId.split('-');
      const lastPart = parts[parts.length - 1] || '';
      if (lastPart && !isNaN(parseInt(lastPart, 10))) {
        sequence = parseInt(lastPart, 10) + 1;
      }
    }
  }

  const paddedSequence = sequence.toString().padStart(padding, '0');
  return `${baseString}${paddedSequence}`;
};
