export const substring = (s1: string, s2: string) => {
	return s1.toLowerCase().includes(s2.toLowerCase());
};

export const capitalize = (s: string) => {
	return s[0].toLocaleUpperCase() + s.slice(1);
};

// Insert in array at specific index.
export const insertAtIndex = (array: any[], index: number, element: any) => {
	return [...array.slice(0, index), element, ...array.slice(index)];
};
