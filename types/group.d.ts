export interface Group {
    dueStarts: string;
    _id: string;
    groupId: string;
    groupName: string;
    totalMembers: number;
    dueOn: DueOn;
    collectionDay: CollectionDay;
    collectionTime: string;
    status: "ACTIVE" | "CLOSED";
    closedAt: string;

    employee?: Employee;
    createdBy?: Employee;
    branch: Branch | string | null;

    createdAt: string;
    updatedAt: string;

}

export type DueOn = "MONTHLY" | "WEEKLY";

export type CollectionDay =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

export interface GroupCreatePayload {
    groupId: string;
    groupName: string;
    totalMembers: number;
    dueOn: DueOn;
    collectionDay: CollectionDay;
    collectionTime: string;
    employee: string; // employee _id
    createdBy: string;
    status: "ACTIVE" | "CLOSED";
}