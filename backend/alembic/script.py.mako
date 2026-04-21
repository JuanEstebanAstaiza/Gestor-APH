${{
    message | indent(8)
}}

Revision ID: ${{rev_id}}
Revises: ${{up_revision if up_revision else 'none'}}
Create Date: ${{create_date}}

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${{ if nullable_import: }}
${{nullable_import}}
${{ endif }}

# revision identifiers, used by Alembic.
revision: str = ${{repr(revision)}}
down_revision: Union[str, None] = ${{repr(down_revision)}}
branch_labels: Union[str, Sequence[str], None] = ${{repr(branch_labels)}}
depends_on: Union[str, Sequence[str], None] = ${{repr(depends_on)}}


def upgrade() -> None:
    ${{ upgrade_body | indent(4) }}


def downgrade() -> None:
    ${{ downgrade_body | indent(4) }}
