print("var color_dict = { ")
with open('color_list',encoding='utf-8')as f:
    dic= f.readlines()
    for line in dic:
        _str = line.strip()
        #print(_str)
        param = _str.split()
        if len(param) < 2:
            #print("not entry: " + _str)
            continue
        if not param[1].startswith('#'):
            #print("not code: " + _str)
            continue
        #print("|" + param[0] + "|" + param[1] + "|")
        n = 20 - len(param[0])
        span = " " * n
        print(" " + param[0] + span + ":     " + "'" + param[1] + "',")

print("}")
