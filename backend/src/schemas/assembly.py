from pydantic import BaseModel


class AssemblyCreate(BaseModel):
    type: str
    title: str
    description: str | None = None
    date: str
    location: str | None = None
    quorum_required: int = 0


class AssemblyUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    date: str | None = None
    location: str | None = None
    status: str | None = None
    quorum_required: int | None = None
    quorum_achieved: bool | None = None
    announced_at: str | None = None


class AssemblyOut(BaseModel):
    id: int
    uuid: str
    type: str
    title: str
    description: str | None
    date: str
    location: str | None
    status: str
    quorum_required: int
    quorum_achieved: bool
    announced_at: str | None
    created_by: int
    is_active: bool

    model_config = {"from_attributes": True}


class AgendaCreate(BaseModel):
    assembly_id: int
    topic: str
    description: str | None = None
    presenter_id: int | None = None
    order: int
    duration_minutes: int | None = None


class AgendaOut(BaseModel):
    id: int
    assembly_id: int
    topic: str
    description: str | None
    presenter_id: int | None
    order: int
    duration_minutes: int | None
    is_active: bool

    model_config = {"from_attributes": True}


class AttendanceCreate(BaseModel):
    assembly_id: int
    resident_id: int
    status: str | None = None


class AttendanceOut(BaseModel):
    id: int
    assembly_id: int
    resident_id: int
    status: str
    confirmed_at: str | None

    model_config = {"from_attributes": True}


class VoteCreate(BaseModel):
    assembly_id: int
    agenda_item_id: int | None = None
    option: str
    notes: str | None = None


class VoteOut(BaseModel):
    id: int
    assembly_id: int
    agenda_item_id: int | None
    voter_id: int
    option: str
    notes: str | None
    voted_at: str

    model_config = {"from_attributes": True}


class VoteSummary(BaseModel):
    agenda_item_id: int | None
    topic: str | None
    favor: int
    en_contra: int
    abstencion: int
    total: int


class MinuteCreate(BaseModel):
    assembly_id: int
    title: str
    content: str
    file_path: str | None = None


class MinuteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    file_path: str | None = None
    version: int | None = None


class MinuteOut(BaseModel):
    id: int
    uuid: str
    assembly_id: int
    title: str
    content: str
    file_path: str | None
    approved_by: int | None
    approved_at: str | None
    version: int
    is_active: bool

    model_config = {"from_attributes": True}
