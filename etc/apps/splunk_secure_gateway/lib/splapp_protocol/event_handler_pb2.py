# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: event_handler.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x13\x65vent_handler.proto\x12\x0b\x41pplication\"\xbf\x01\n\x06\x43hange\x12\x1f\n\x04link\x18\x01 \x01(\x0b\x32\x11.Application.Link\x12\x1e\n\x04sets\x18\x02 \x03(\x0b\x32\x10.Application.Set\x12 \n\x05\x65vals\x18\x03 \x03(\x0b\x32\x11.Application.Eval\x12\"\n\x06unsets\x18\x04 \x03(\x0b\x32\x12.Application.Unset\x12.\n\nconditions\x18\x05 \x03(\x0b\x32\x1a.Application.FormCondition\"\xbd\x01\n\x04Init\x12\x1f\n\x04link\x18\x01 \x01(\x0b\x32\x11.Application.Link\x12\x1e\n\x04sets\x18\x02 \x03(\x0b\x32\x10.Application.Set\x12 \n\x05\x65vals\x18\x03 \x03(\x0b\x32\x11.Application.Eval\x12\"\n\x06unsets\x18\x04 \x03(\x0b\x32\x12.Application.Unset\x12.\n\nconditions\x18\x05 \x03(\x0b\x32\x1a.Application.FormCondition\"\xdb\x01\n\rFormCondition\x12\x0f\n\x05label\x18\x01 \x01(\tH\x00\x12\x0f\n\x05match\x18\x02 \x01(\tH\x00\x12\x0f\n\x05value\x18\x03 \x01(\tH\x00\x12\x1f\n\x04link\x18\x04 \x01(\x0b\x32\x11.Application.Link\x12\x1e\n\x04sets\x18\x05 \x03(\x0b\x32\x10.Application.Set\x12 \n\x05\x65vals\x18\x06 \x03(\x0b\x32\x11.Application.Eval\x12\"\n\x06unsets\x18\x07 \x03(\x0b\x32\x12.Application.UnsetB\x10\n\x0ematchAttribute\"\x9c\x01\n\x04Link\x12\x0e\n\x06target\x18\x01 \x01(\t\x12\x0b\n\x03url\x18\x02 \x01(\t\x12\x13\n\x0b\x64\x61shboardId\x18\x03 \x01(\t\x12\x31\n\x08inputMap\x18\x04 \x03(\x0b\x32\x1f.Application.Link.InputMapEntry\x1a/\n\rInputMapEntry\x12\x0b\n\x03key\x18\x01 \x01(\t\x12\r\n\x05value\x18\x02 \x01(\t:\x02\x38\x01\"C\n\x03Set\x12\r\n\x05token\x18\x01 \x01(\t\x12\r\n\x05value\x18\x02 \x01(\t\x12\x0e\n\x06prefix\x18\x03 \x01(\t\x12\x0e\n\x06suffix\x18\x04 \x01(\t\"$\n\x04\x45val\x12\r\n\x05token\x18\x01 \x01(\t\x12\r\n\x05value\x18\x02 \x01(\t\"\x16\n\x05Unset\x12\r\n\x05token\x18\x01 \x01(\t\"\xc7\x01\n\tDrillDown\x12\x1f\n\x04link\x18\x01 \x01(\x0b\x32\x11.Application.Link\x12\x1e\n\x04sets\x18\x02 \x03(\x0b\x32\x10.Application.Set\x12 \n\x05\x65vals\x18\x03 \x03(\x0b\x32\x11.Application.Eval\x12\"\n\x06unsets\x18\x04 \x03(\x0b\x32\x12.Application.Unset\x12\x33\n\nconditions\x18\x05 \x03(\x0b\x32\x1f.Application.DrillDownCondition\"\xaa\x01\n\x12\x44rillDownCondition\x12\r\n\x05\x66ield\x18\x01 \x01(\t\x12\x1f\n\x04link\x18\x02 \x01(\x0b\x32\x11.Application.Link\x12\x1e\n\x04sets\x18\x03 \x03(\x0b\x32\x10.Application.Set\x12 \n\x05\x65vals\x18\x04 \x03(\x0b\x32\x11.Application.Eval\x12\"\n\x06unsets\x18\x05 \x03(\x0b\x32\x12.Application.Unset\"\x81\x03\n\rSearchHandler\x12\x38\n\x05state\x18\x01 \x01(\x0e\x32).Application.SearchHandler.SearchJobState\x12\x30\n\nconditions\x18\x02 \x03(\x0b\x32\x1c.Application.SearchCondition\x12\x1f\n\x04link\x18\x03 \x01(\x0b\x32\x11.Application.Link\x12\x1e\n\x04sets\x18\x04 \x03(\x0b\x32\x10.Application.Set\x12 \n\x05\x65vals\x18\x05 \x03(\x0b\x32\x11.Application.Eval\x12\"\n\x06unsets\x18\x06 \x03(\x0b\x32\x12.Application.Unset\"}\n\x0eSearchJobState\x12\x11\n\rSTATE_UNKNOWN\x10\x00\x12\x0e\n\nSTATE_DONE\x10\x01\x12\x0f\n\x0bSTATE_ERROR\x10\x02\x12\x0e\n\nSTATE_FAIL\x10\x03\x12\x13\n\x0fSTATE_CANCELLED\x10\x04\x12\x12\n\x0eSTATE_PROGRESS\x10\x05\"\xa7\x01\n\x0fSearchCondition\x12\r\n\x05match\x18\x01 \x01(\t\x12\x1f\n\x04link\x18\x02 \x01(\x0b\x32\x11.Application.Link\x12\x1e\n\x04sets\x18\x03 \x03(\x0b\x32\x10.Application.Set\x12 \n\x05\x65vals\x18\x04 \x03(\x0b\x32\x11.Application.Eval\x12\"\n\x06unsets\x18\x05 \x03(\x0b\x32\x12.Application.Unset\"\x8a\x01\n\x11SearchJobMetadata\x12\x42\n\nproperties\x18\x01 \x03(\x0b\x32..Application.SearchJobMetadata.PropertiesEntry\x1a\x31\n\x0fPropertiesEntry\x12\x0b\n\x03key\x18\x01 \x01(\t\x12\r\n\x05value\x18\x02 \x01(\t:\x02\x38\x01\x42@Z>cd.splunkdev.com/mobile/spacebridge-golang-protos/splunkcx/ssgb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'event_handler_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  DESCRIPTOR._serialized_options = b'Z>cd.splunkdev.com/mobile/spacebridge-golang-protos/splunkcx/ssg'
  _LINK_INPUTMAPENTRY._options = None
  _LINK_INPUTMAPENTRY._serialized_options = b'8\001'
  _SEARCHJOBMETADATA_PROPERTIESENTRY._options = None
  _SEARCHJOBMETADATA_PROPERTIESENTRY._serialized_options = b'8\001'
  _CHANGE._serialized_start=37
  _CHANGE._serialized_end=228
  _INIT._serialized_start=231
  _INIT._serialized_end=420
  _FORMCONDITION._serialized_start=423
  _FORMCONDITION._serialized_end=642
  _LINK._serialized_start=645
  _LINK._serialized_end=801
  _LINK_INPUTMAPENTRY._serialized_start=754
  _LINK_INPUTMAPENTRY._serialized_end=801
  _SET._serialized_start=803
  _SET._serialized_end=870
  _EVAL._serialized_start=872
  _EVAL._serialized_end=908
  _UNSET._serialized_start=910
  _UNSET._serialized_end=932
  _DRILLDOWN._serialized_start=935
  _DRILLDOWN._serialized_end=1134
  _DRILLDOWNCONDITION._serialized_start=1137
  _DRILLDOWNCONDITION._serialized_end=1307
  _SEARCHHANDLER._serialized_start=1310
  _SEARCHHANDLER._serialized_end=1695
  _SEARCHHANDLER_SEARCHJOBSTATE._serialized_start=1570
  _SEARCHHANDLER_SEARCHJOBSTATE._serialized_end=1695
  _SEARCHCONDITION._serialized_start=1698
  _SEARCHCONDITION._serialized_end=1865
  _SEARCHJOBMETADATA._serialized_start=1868
  _SEARCHJOBMETADATA._serialized_end=2006
  _SEARCHJOBMETADATA_PROPERTIESENTRY._serialized_start=1957
  _SEARCHJOBMETADATA_PROPERTIESENTRY._serialized_end=2006
# @@protoc_insertion_point(module_scope)
