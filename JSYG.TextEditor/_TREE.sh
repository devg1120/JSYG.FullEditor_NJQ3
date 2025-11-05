#!/bin/bash
#{{{function dir_tree()
function dir_tree()
{
  local dir=$1
  local indent="$2  "
  local head
  local next
  local list="$(find $dir -maxdepth 1 | sed 1d)"
  local num=$(echo "$list" | wc -w)
  local count=0
  local name

  for file in $list
  do
    ((count++))
    if [ $count -eq $num ]
    then
      head="$indent└─ "
      next="$indent "
    else
      head="$indent├─ "
      next="$indent│"
    fi

    name=$(basename $file)
    #echo "$head$name"

    if [ -d "${file}" ] ; then
       echo "$head$name/"
    else
       echo "$head$name"
    fi

    [ -d "$dir/$name" -a ! -L "$dir/$name" ] && dir_tree $dir/$name "$next"
  done
  
}
#}}}

top=$1
path="$(cd -- "$(dirname -- "$1")" && pwd)/$(basename -- "$1")"
name=$(basename $top)
echo "$path"/

dir_tree $top
